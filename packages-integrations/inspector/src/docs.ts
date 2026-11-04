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
  const entries = new Map<string, Promise<DocsEntry | undefined>>()
  let preparePromise: Promise<void> | undefined

  async function getAutocomplete() {
    return autocomplete ??= createAutocomplete(await generatorPromise)
  }

  function getEntry(token: string) {
    let entry = entries.get(token)
    if (!entry) {
      entry = generateEntry(token).catch(() => undefined)
      entries.set(token, entry)
    }
    return entry
  }

  async function generateEntry(token: string): Promise<DocsEntry | undefined> {
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

    // Colors may reference theme variables emitted as preflights (e.g.
    // preset-wind4's `--colors-*`) — resolve them against those preflights
    const vars = collectVariables(result.css)
    if (result.css.includes('var(--')) {
      const withPreflights = await generator.generate(new Set([token]), { preflights: true, safelist: false })
      for (const [name, value] of collectVariables(withPreflights.css)) {
        if (!vars.has(name))
          vars.set(name, value)
      }
    }

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

  async function enumerate() {
    const ac = await getAutocomplete()
    const keys = AZ.flatMap(i => [i, ...[...AZ, '-'].map(j => `${i}${j}`)])
    const suggestions = await Promise.all(keys.map(key => ac.suggest(key)))
    return uniq(suggestions.flat())
  }

  function prepare() {
    return preparePromise ??= enumerate()
      .then(tokens => Promise.all(tokens.slice(0, PREPARE_LIMIT).map(getEntry)))
      .then(() => {})
  }

  async function getKnownEntries() {
    return (await Promise.all(entries.values())).filter(notNull)
  }

  /**
   * Search utilities by class name or by the CSS they generate. Tokens that
   * match directly come first, then autocomplete expansions, then entries
   * whose class or CSS body contains the query.
   */
  async function search(input: string, limit = 50): Promise<DocsSearchItem[]> {
    input = input.trim()
    if (!input)
      return []

    await prepare()
    const ac = await getAutocomplete()
    const parts = uniq(input.split(/\s+/g).filter(Boolean))

    const exact = (await Promise.all(parts.map(getEntry))).filter(notNull)

    const suggested = uniq((await Promise.all([
      ...parts,
      ...parts.map(i => `${i}-`),
      ...parts.flatMap(i => AZ09.map(a => `${i}-${a}`)),
    ].map(i => ac.suggest(i)))).flat())
    await Promise.all(suggested.slice(0, limit * 4).map(getEntry))

    const ranked = (await getKnownEntries())
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
const VAR_RE = /var\((--[\w-]+)(?:,([^()]*))?\)/g
const COLOR_RE = /(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color-mix|color)\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)|#[\da-f]{3,8}\b/gi

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
 * Substitute `var()` references, following chains a few levels deep.
 * Returns `undefined` when a reference has neither a value nor a fallback.
 */
export function resolveVariables(value: string, vars: Map<string, string>): string | undefined {
  let unresolved = false
  for (let depth = 0; depth < 8 && value.includes('var(--'); depth++) {
    const next = value.replace(VAR_RE, (_, name: string, fallback?: string) => {
      const resolved = vars.get(name) ?? fallback?.trim()
      if (resolved == null)
        unresolved = true
      return resolved ?? ''
    })
    if (unresolved)
      return
    if (next === value)
      break
    value = next
  }
  return value.includes('var(--') ? undefined : value
}

/**
 * Colors found in declaration values, with variables resolved so the client
 * can paint a swatch. Colors that still depend on unknown variables are
 * dropped rather than rendered wrong.
 */
export function extractColors(css: string, vars: Map<string, string> = collectVariables(css)): string[] {
  const colors: string[] = []
  // Comments carry hints like `/* oklch(...) */` that are not applied colors
  for (const [, , raw] of css.replace(AT_PROPERTY_RE, '').replace(COMMENT_RE, '').matchAll(DECLARATION_RE)) {
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
  return uniq([...css.replace(AT_PROPERTY_RE, '').replace(COMMENT_RE, '').matchAll(DECLARATION_RE)].map(i => i[1]))
}
