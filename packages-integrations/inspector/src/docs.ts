import type { Rule, Shortcut, UnoGenerator, Variant } from '@unocss/core'
import type { DocsItem, DocsItemKind, DocsRuleSource, DocsSearchItem, DocsShortcutSource, DocsVariantStep } from '../types'
import { createAutocomplete } from '@unocss/autocomplete'
import { createGenerator, notNull, uniq } from '@unocss/core'

interface DocsEntry {
  item: DocsItem
  rules: readonly Rule<any>[]
}

/**
 * How many autocomplete suggestions are generated up front, so searching by
 * CSS body (e.g. `flex` finding `flex` and `display-flex` alike) has a
 * corpus to match against. Mirrors the interactive docs.
 */
const PREPARE_LIMIT = 500

/** Utilities generated on demand that stay cached, beyond the prepared ones. */
const CACHE_LIMIT = 1000

const AZ = Array.from('abcdefghijklmnopqrstuvwxyz')
const AZ09 = [...AZ, ...Array.from('0123456789')]

/**
 * Interactive docs for the project's own UnoCSS config — the server-side
 * counterpart of https://unocss.dev/interactive/. Everything runs against the
 * real generator, so custom rules, shortcuts, variants, theme and presets are
 * documented exactly as the project resolves them.
 *
 * The engine snapshots the generator it was created for; recreate it when the
 * config reloads.
 */
export function createDocsEngine(uno: UnoGenerator<any>) {
  // Rule/variant/shortcut provenance is only recorded with `details` on —
  // the default in dev, but a project may disable it. Use a details-enabled
  // twin of the generator then, leaving the project's generator untouched.
  const generatorPromise: Promise<UnoGenerator<any>> = uno.config.details
    ? Promise.resolve(uno)
    : createGenerator({ ...uno.userConfig, details: true }, uno.defaults)

  let autocomplete: ReturnType<typeof createAutocomplete> | undefined
  // Least recently used first; the prepared corpus is kept apart so eviction
  // never shrinks what searching by CSS body can find
  const cache = new Map<string, Promise<DocsEntry | undefined>>()
  const corpus = new Map<string, DocsEntry>()
  let preparePromise: Promise<void> | undefined
  // Theme variables emitted as preflights (e.g. preset-wind4's `--colors-*`),
  // collected in batches so each utility does not regenerate the preflights
  const themeVariables = new Map<string, string>()

  async function getAutocomplete() {
    return autocomplete ??= createAutocomplete(await generatorPromise)
  }

  /**
   * @param token the utility to generate
   * @param themeLoaded the caller already loaded the token's theme variables
   * with `loadThemeVariables`, so no per-token preflight pass is needed
   */
  function getEntry(token: string, themeLoaded = false): Promise<DocsEntry | undefined> {
    const prepared = corpus.get(token)
    if (prepared)
      return Promise.resolve(prepared)
    let entry = cache.get(token)
    if (entry) {
      cache.delete(token)
    }
    else {
      entry = generateEntry(token, themeLoaded).catch(() => undefined)
      if (cache.size >= CACHE_LIMIT)
        cache.delete(cache.keys().next().value!)
    }
    cache.set(token, entry)
    return entry
  }

  async function loadThemeVariables(tokens: string[]) {
    if (!tokens.length)
      return
    const generator = await generatorPromise
    const { css } = await generator.generate(new Set(tokens), { preflights: true, safelist: false })
    for (const [name, value] of collectVariables(css)) {
      if (!themeVariables.has(name))
        themeVariables.set(name, value)
    }
  }

  async function generateEntry(token: string, themeLoaded: boolean): Promise<DocsEntry | undefined> {
    const generator = await generatorPromise
    const utils = await generator.parseToken(token)
    if (!utils?.length)
      return

    // Prefer the utility's own CSS over the `@property` registrations a
    // preset may emit alongside it
    const last = utils.findLast(util => !util[1]?.startsWith('@property')) ?? utils[utils.length - 1]!
    const context = last[5]
    const result = await generator.generate(new Set([token]), { preflights: false, safelist: false })
    if (!result.css)
      return

    const rules = context?.rules ?? []
    const shortcuts = getShortcutSources(context?.shortcuts)
    const variants = getVariantSteps(generator, token, context?.variants, context?.variantHandlers)

    if (!themeLoaded && hasUnresolvedVariables(result.css, getVariables(result.css)))
      await loadThemeVariables([token])
    const vars = getVariables(result.css)

    const item: DocsItem = {
      class: token,
      body: last[2].replace(/([:;])/g, '$1 ').trim(),
      kind: getKind(rules, shortcuts, variants),
      css: result.css,
      layers: result.layers.filter(i => i !== 'default'),
      colors: extractColors(result.css, vars),
      properties: extractProperties(result.css),
      rules: rules.map(rule => getRuleSource(generator, rule)),
      shortcuts,
      variants,
      aliases: [],
      sameRule: [],
    }
    item.color = item.colors[0]

    return { item, rules }
  }

  /** The utility's own variables, then the theme's. */
  function getVariables(css: string) {
    const vars = collectVariables(css)
    for (const [name, value] of themeVariables) {
      if (!vars.has(name))
        vars.set(name, value)
    }
    return vars
  }

  async function enumerate() {
    const ac = await getAutocomplete()
    const keys = AZ.flatMap(i => [i, ...[...AZ, '-'].map(j => `${i}${j}`)])
    const suggestions = await Promise.all(keys.map(key => ac.suggest(key)))
    return uniq(suggestions.flat())
  }

  function prepare() {
    return preparePromise ??= (async () => {
      const tokens = (await enumerate()).slice(0, PREPARE_LIMIT)
      await loadThemeVariables(tokens)
      for (const entry of await Promise.all(tokens.map(token => getEntry(token, true)))) {
        if (entry)
          corpus.set(entry.item.class, entry)
      }
    })().catch((error) => {
      // Let the next search retry instead of failing until the config reloads
      preparePromise = undefined
      throw error
    })
  }

  async function getKnownEntries() {
    return uniq([...corpus.values(), ...(await Promise.all(cache.values())).filter(notNull)])
  }

  /**
   * Search utilities by class name or by the CSS they generate. Tokens that
   * match directly come first, then the prepared corpus and the query's
   * autocomplete expansions, ranked by how closely they match.
   */
  async function search(input: string, limit = 50): Promise<DocsSearchItem[]> {
    input = input.trim()
    if (!input)
      return []

    await prepare()
    const ac = await getAutocomplete()
    const parts = uniq(input.split(/\s+/g).filter(Boolean))

    const suggested = uniq((await Promise.all([
      ...parts,
      ...parts.map(i => `${i}-`),
      ...parts.flatMap(i => AZ09.map(a => `${i}-${a}`)),
    ].map(i => ac.suggest(i)))).flat()).slice(0, limit * 4)

    // Only utilities not generated yet still need their theme variables
    await loadThemeVariables([...parts, ...suggested].filter(token => !cache.has(token) && !corpus.has(token)))
    const exact = (await Promise.all(parts.map(part => getEntry(part, true)))).filter(notNull)
    const expanded = (await Promise.all(suggested.map(token => getEntry(token, true)))).filter(notNull)

    const ranked = uniq([...corpus.values(), ...expanded])
      .map(entry => ({ entry, score: rank(entry.item, parts) }))
      .filter(i => i.score < Number.POSITIVE_INFINITY)
      .sort((a, b) => a.score - b.score || a.entry.item.class.length - b.entry.item.class.length || a.entry.item.class.localeCompare(b.entry.item.class))
      .map(i => i.entry)

    return uniq([...exact, ...ranked])
      .slice(0, limit)
      .map(({ item }) => toSearchItem(item))
  }

  /**
   * Full details for one utility, including its aliases (other utilities
   * generating the same CSS body) and siblings matched by the same rules.
   */
  async function getItem(token: string): Promise<DocsItem | null> {
    token = token.trim()
    if (!token)
      return null

    await prepare()
    const entry = await getEntry(token)
    if (!entry)
      return null

    const known = await getKnownEntries()
    return {
      ...entry.item,
      aliases: known
        .filter(i => i.item.body === entry.item.body && i.item.class !== token)
        .map(i => i.item.class)
        .sort(),
      sameRule: entry.rules.length
        ? known
            .filter(i => i !== entry
              && i.rules.length === entry.rules.length
              && i.rules.every((rule, idx) => rule === entry.rules[idx]))
            .map(i => i.item.class)
            .sort()
        : [],
    }
  }

  return {
    search,
    getItem,
  }
}

export type DocsEngine = ReturnType<typeof createDocsEngine>

function toSearchItem(item: DocsItem): DocsSearchItem {
  return {
    class: item.class,
    body: item.body,
    kind: item.kind,
    color: item.color,
  }
}

/**
 * Lower is better; `Infinity` drops the entry. Each query part is scored on
 * its own and the best part wins, so `p-2 flex` surfaces both utilities.
 */
function rank(item: DocsSearchItem, parts: string[]) {
  const name = item.class.toLowerCase()
  const body = item.body.toLowerCase()
  let best = Number.POSITIVE_INFINITY
  for (const raw of parts) {
    const part = raw.toLowerCase()
    let score = Number.POSITIVE_INFINITY
    if (name === part)
      score = 0
    else if (name.startsWith(part))
      score = 1
    else if (name.includes(part))
      score = 2
    else if (body.includes(part))
      score = 3
    best = Math.min(best, score)
  }
  return best
}

function getKind(rules: readonly Rule<any>[], shortcuts: DocsShortcutSource[], variants: DocsVariantStep[]): DocsItemKind {
  if (shortcuts.length)
    return 'shortcut'
  if (variants.length > 1)
    return 'variant'
  if (rules.length && rules.every(rule => typeof rule[0] === 'string'))
    return 'static'
  return 'dynamic'
}

function findPresetName(uno: UnoGenerator<any>, predicate: (preset: { rules?: unknown[], variants?: unknown[], shortcuts?: unknown }) => boolean | undefined) {
  return uno.config.presets.find(predicate)?.name
}

function getRuleSource(uno: UnoGenerator<any>, rule: Rule<any>): DocsRuleSource {
  const matcher = rule[0]
  return {
    matcher: typeof matcher === 'string' ? matcher : String(matcher),
    static: typeof matcher === 'string',
    preset: findPresetName(uno, p => p.rules?.includes(rule)),
  }
}

function getShortcutSources(shortcuts?: Shortcut<any>[]): DocsShortcutSource[] {
  return (shortcuts ?? []).map(([from, to]) => ({
    from: String(from),
    to: typeof to === 'function'
      ? '(dynamic)'
      : Array.isArray(to)
        ? to.map(i => typeof i === 'string' ? i : '(css object)').join(' ')
        : typeof to === 'string' ? to : '(css object)',
  }))
}

/**
 * Walk the variant chain the way the generator applied it: the raw class,
 * then the selector each variant handed to the next round of matching.
 */
function getVariantSteps(
  uno: UnoGenerator<any>,
  token: string,
  variants: Variant<any>[] | undefined,
  handlers: { matcher?: string }[] | undefined,
): DocsVariantStep[] {
  if (!variants?.length)
    return []
  const preset = (variant?: Variant<any>) => variant
    ? findPresetName(uno, p => p.variants?.includes(variant))
    : undefined

  const steps: DocsVariantStep[] = [{
    name: variants[0]?.name,
    preset: preset(variants[0]),
    result: token,
  }]
  handlers?.forEach((handler, idx) => {
    const variant = variants[idx + 1]
    steps.push({
      name: variant?.name,
      preset: preset(variant),
      result: handler.matcher ?? '',
    })
  })
  return steps
}

// A declaration opens a line or follows `{` / `;` and ends at `;` or `}` —
// never at `{`, which keeps selectors like `a:hover{` out
const DECLARATION_RE = /(?:^|[{;])\s*([a-z][\w-]*):([^;{}]+)(?=[;}])/gm
const VARIABLE_DECLARATION_RE = /(?:^|[{;])\s*(--[\w-]+):([^;{}]+)(?=[;}])/gm
// `@property` descriptors (`syntax`, `inherits`, `initial-value`) read like
// declarations but are not CSS properties
const AT_PROPERTY_RE = /@property\s+(--[\w-]+)\s*\{([^}]*)\}/g
const COMMENT_RE = /\/\*.*?\*\//gs
const COLOR_RE = /(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color-mix|color)\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)|#[\da-f]{3,8}\b/gi
// Substitution passes before a `var()` chain is treated as a cycle
const MAX_VARIABLE_PASSES = 32

/**
 * The CSS a utility applies, without `@property` registrations or comments
 * (which carry hints like an `oklch(...)` value that is not applied).
 */
function stripNonDeclarations(css: string) {
  return css.replace(AT_PROPERTY_RE, '').replace(COMMENT_RE, '')
}

/**
 * Custom property values a stylesheet defines, with `@property` initial
 * values as the fallback for properties never declared.
 */
export function collectVariables(css: string): Map<string, string> {
  const vars = new Map<string, string>()
  for (const [, name, body] of css.matchAll(AT_PROPERTY_RE)) {
    const initial = body.match(/initial-value:([^;]+)/)?.[1]?.trim()
    if (initial)
      vars.set(name, initial)
  }
  for (const [, name, value] of css.matchAll(VARIABLE_DECLARATION_RE))
    vars.set(name, value.trim())
  return vars
}

/**
 * Substitute `var()` references outermost first, following chains and
 * fallbacks of any nesting (`var(--a, rgb(0 0 0 / var(--b)))`). Returns
 * `undefined` when a reference has neither a value nor a fallback.
 */
export function resolveVariables(value: string, vars: Map<string, string>): string | undefined {
  for (let pass = 0; pass < MAX_VARIABLE_PASSES; pass++) {
    const start = value.indexOf('var(')
    if (start < 0)
      return value

    let depth = 0
    let comma = -1
    let end = -1
    for (let i = start + 3; i < value.length && end < 0; i++) {
      const char = value[i]
      if (char === '(')
        depth++
      else if (char === ')' && --depth === 0)
        end = i
      else if (char === ',' && depth === 1 && comma < 0)
        comma = i
    }
    if (end < 0)
      return

    const name = value.slice(start + 4, comma < 0 ? end : comma).trim()
    const resolved = vars.get(name) ?? (comma < 0 ? undefined : value.slice(comma + 1, end).trim())
    if (resolved == null)
      return
    value = value.slice(0, start) + resolved + value.slice(end + 1)
  }
}

function getDeclarationValues(css: string) {
  const stripped = stripNonDeclarations(css)
  return [...stripped.matchAll(DECLARATION_RE), ...stripped.matchAll(VARIABLE_DECLARATION_RE)].map(i => i[2])
}

/**
 * Whether a declaration references a variable `vars` cannot resolve.
 */
function hasUnresolvedVariables(css: string, vars: Map<string, string>): boolean {
  return getDeclarationValues(css).some(value => resolveVariables(value, vars) === undefined)
}

/**
 * Colors found in declaration values, with variables resolved so the client
 * can paint a swatch. Standard properties come first, then custom ones (the
 * only place utilities like gradient stops and ring colors set theirs).
 * Colors that still depend on unknown variables are dropped rather than
 * rendered wrong.
 */
export function extractColors(css: string, vars: Map<string, string> = collectVariables(css)): string[] {
  const colors: string[] = []
  for (const raw of getDeclarationValues(css)) {
    const value = resolveVariables(raw, vars)
    if (!value)
      continue
    for (const [color] of value.matchAll(COLOR_RE))
      colors.push(color)
  }
  return uniq(colors)
}

/**
 * Standard CSS properties a utility sets (custom properties and `@property`
 * descriptors excluded), used to link each one to its MDN reference.
 */
export function extractProperties(css: string): string[] {
  return uniq([...stripNonDeclarations(css).matchAll(DECLARATION_RE)].map(i => i[1]))
}
