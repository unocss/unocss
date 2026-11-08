import type { SourceCodeTransformer, UnoGenerator, Variant } from '@unocss/core'
import { escapeRegExp, parseVariantGroup } from '@unocss/core'

export interface TransformerBuildThemesOptions {
  /**
   * Theme facets: independent aspects of a theme, each listing its values.
   * A build's theme is one value per facet. The values are the class prefixes
   * (`acme:c-red`), and the facet names are yours to choose.
   *
   * @example
   * ```ts
   * {
   *   client: ['acme', 'globex'],
   *   edition: ['standard', 'premium'],
   * }
   * ```
   */
  facets: Record<string, readonly string[]>

  /**
   * The active value of every facet, resolved by the caller (for example from
   * an environment variable in a CI build matrix). Classes prefixed with any
   * other value are removed.
   *
   * @example
   * ```ts
   * { client: 'acme', edition: 'premium' }
   * ```
   */
  active: Record<string, string>
}

interface ResolvedFacets {
  /** The active value of every facet. */
  active: Set<string>
  /** Every other facet value. */
  inactive: Set<string>
  /** All facet values, active and inactive. */
  values: string[]
}

const NAME_RE = /^[a-z][\w-]*$/i
const TRANSFORMER_NAME = '@unocss/transformer-build-themes'
const VARIANT_NAME_PREFIX = `${TRANSFORMER_NAME}:`

/**
 * Characters that end a class-like token outside brackets: whitespace, string
 * delimiters, and the punctuation around class lists in HTML, JS and CSS.
 * `>` ends a valueless attributify attribute (`<div acme:c-red>`); no variant
 * starts with it.
 */
const TERMINATORS = new Set([' ', '\t', '\n', '\r', '\f', '\v', '"', '\'', '`', ';', '{', '}', ',', '(', ')', '[', ']', '>'])

/**
 * The longest bracketed or parenthesized value the scanner looks through, so
 * that unbalanced brackets in minified code cannot make a scan quadratic.
 * Arbitrary values this long (such as inline data URIs) are left as they are.
 */
const MAX_VALUE_LENGTH = 4096

function isSpace(char: string | undefined) {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f' || char === '\v'
}

/**
 * Returns the index after the bracket that opens at `start`, or `-1` when it
 * does not close before whitespace. Brackets nest, quoted strings inside them
 * may contain `]`, and `\` escapes the next character.
 */
function closeBracket(code: string, start: number): number {
  let depth = 0
  let quote = ''
  const limit = Math.min(code.length, start + MAX_VALUE_LENGTH)
  for (let i = start; i < limit; i++) {
    const char = code[i]
    if (isSpace(char) || char === '`')
      return -1
    if (char === '\\') {
      i++
      continue
    }
    if (quote) {
      if (char === quote)
        quote = ''
      continue
    }
    if (char === '\'' || char === '"')
      quote = char
    else if (char === '[')
      depth++
    else if (char === ']' && --depth === 0)
      return i + 1
  }
  return -1
}

/**
 * Returns the index after a parenthesized value such as `bg-(--accent)`, or `-1`
 * when the parenthesis does not close within the same token.
 */
function closeParen(code: string, start: number): number {
  const limit = Math.min(code.length, start + MAX_VALUE_LENGTH)
  for (let i = start + 1; i < limit; i++) {
    const char = code[i]
    if (char === ')')
      return i + 1
    if (isSpace(char) || char === '(' || char === '"' || char === '\'' || char === '`' || char === ';' || char === '{' || char === '}')
      return -1
  }
  return -1
}

/**
 * Tells, without scanning, when a bracket at `start` cannot close: there is no
 * `]` before the next whitespace or backtick, or none within
 * `MAX_VALUE_LENGTH`. Positions only move forward, so both lookups are cached
 * and a run of unclosed brackets costs linear time in total.
 */
function createBracketCheck(code: string) {
  let nextClose = -2
  let nextBreak = -2
  const breakRE = /[\s`]/g
  return (start: number): boolean => {
    if (nextClose === -2 || (nextClose !== -1 && nextClose < start))
      nextClose = code.indexOf(']', start)
    if (nextBreak === -2 || (nextBreak !== -1 && nextBreak < start)) {
      breakRE.lastIndex = start
      nextBreak = breakRE.exec(code)?.index ?? -1
    }
    return nextClose !== -1
      && (nextBreak === -1 || nextClose < nextBreak)
      && nextClose - start < MAX_VALUE_LENGTH
  }
}

/**
 * Finds class-like tokens: runs of characters between terminators, with
 * bracketed arbitrary values (`[&_a]`, `content-['a b']`), parenthesized
 * values (`bg-(--accent)`) and escaped characters (`\:`) kept inside the token.
 */
function* scanTokens(code: string): Generator<[start: number, end: number]> {
  const canClose = createBracketCheck(code)
  let i = 0
  while (i < code.length) {
    const start = i
    let end = i
    while (end < code.length) {
      const char = code[end]
      if (char === '\\') {
        if (end + 1 < code.length && !isSpace(code[end + 1])) {
          end += 2
          continue
        }
        break
      }
      if (char === '[') {
        // `['acme:a', x]` is an array of class strings, not an arbitrary variant.
        if (end === start && (code[end + 1] === '\'' || code[end + 1] === '"'))
          break
        const close = canClose(end) ? closeBracket(code, end) : -1
        if (close < 0)
          break
        end = close
        continue
      }
      if (char === '(' && end > start && (code[end - 1] === '-' || code[end - 1] === ':')) {
        const close = closeParen(code, end)
        if (close < 0)
          break
        end = close
        continue
      }
      if (TERMINATORS.has(char))
        break
      end++
    }

    if (end === start) {
      i++
      continue
    }
    i = end
    // A JSX self-closing slash is not part of the class: `<Card acme:c-red/>`.
    while (end > start && code[end - 1] === '/')
      end--
    if (end > start)
      yield [start, end]
  }
}

function resolveFacets(options: TransformerBuildThemesOptions): ResolvedFacets {
  const { facets, active } = options ?? {}
  if (!facets || typeof facets !== 'object' || !Object.keys(facets).length)
    throw new Error('[transformer-build-themes] `facets` must define at least one facet.')
  if (!active || typeof active !== 'object')
    throw new Error('[transformer-build-themes] `active` must name the active value of every facet.')

  const seen = new Map<string, string>()
  const activeSet = new Set<string>()
  const inactiveSet = new Set<string>()

  for (const [facet, values] of Object.entries(facets)) {
    if (!Array.isArray(values) || !values.length)
      throw new Error(`[transformer-build-themes] Facet "${facet}" must list at least one value.`)

    for (const value of values) {
      if (!NAME_RE.test(value))
        throw new Error(`[transformer-build-themes] Invalid value "${value}" in facet "${facet}": use letters, digits, "-" or "_", starting with a letter.`)
      const owner = seen.get(value)
      if (owner !== undefined)
        throw new Error(`[transformer-build-themes] Value "${value}" is listed in both facets "${owner}" and "${facet}". Values must be unique across facets.`)
      seen.set(value, facet)
    }

    const current = active[facet]
    if (current === undefined)
      throw new Error(`[transformer-build-themes] No active value for facet "${facet}". Expected one of: ${values.join(', ')}.`)
    if (!values.includes(current))
      throw new Error(`[transformer-build-themes] Active value "${current}" is not listed in facet "${facet}". Expected one of: ${values.join(', ')}.`)

    for (const value of values)
      (value === current ? activeSet : inactiveSet).add(value)
  }

  for (const facet of Object.keys(active)) {
    if (!(facet in facets))
      throw new Error(`[transformer-build-themes] \`active\` names facet "${facet}", which is not defined in \`facets\`.`)
  }

  return { active: activeSet, inactive: inactiveSet, values: [...seen.keys()] }
}

/**
 * Splits a class at top-level `:` separators. Separators inside brackets or
 * parentheses (`[&:hover]`, `bg-(--a:b)`), inside quoted strings within
 * brackets, and escaped ones (`\:`) do not split.
 */
function splitSegments(token: string): string[] {
  const segments: string[] = []
  let depth = 0
  let quote = ''
  let start = 0
  for (let i = 0; i < token.length; i++) {
    const char = token[i]
    if (char === '\\') {
      i++
      continue
    }
    if (quote) {
      if (char === quote)
        quote = ''
      continue
    }
    if (depth > 0 && (char === '\'' || char === '"')) {
      quote = char
    }
    else if (char === '[' || char === '(') {
      depth++
    }
    else if (char === ']' || char === ')') {
      depth = Math.max(0, depth - 1)
    }
    else if (char === ':' && depth === 0) {
      segments.push(token.slice(start, i))
      start = i + 1
    }
  }
  segments.push(token.slice(start))
  return segments
}

/**
 * Returns the separator of a variant group, the character before its first
 * `(` outside brackets: `:` for `acme:(a b)`, `-` for `acme:bg-(red blue)`.
 */
function groupSeparator(group: string): string | undefined {
  let depth = 0
  for (let i = 0; i < group.length; i++) {
    const char = group[i]
    if (char === '\\')
      i++
    else if (char === '[')
      depth++
    else if (char === ']')
      depth = Math.max(0, depth - 1)
    else if (char === '(' && depth === 0)
      return group[i - 1]
  }
  return undefined
}

/**
 * Resolves one class against the build's facet values.
 *
 * @returns the class with active prefixes removed, `null` when a prefix is an
 * inactive value, or `undefined` when the class is left as is.
 */
function resolveClass(token: string, facets: ResolvedFacets): string | null | undefined {
  const important = token.startsWith('!') ? '!' : ''
  const segments = splitSegments(important ? token.slice(1) : token)
  if (segments.length < 2)
    return undefined

  const utility = segments.at(-1)!
  const variants = segments.slice(0, -1)

  // `acme: true`, `acme://host` and `a::b` are not classes. A trailing `=` is an
  // attribute name followed by something other than a quoted value, such as a
  // Svelte `class:acme:c-red={on}` directive, which is left alone.
  if (!utility || utility.startsWith('/') || utility.endsWith('=') || variants.some(v => !v))
    return undefined

  let hasActive = false
  for (const variant of variants) {
    if (facets.inactive.has(variant))
      return null
    if (facets.active.has(variant))
      hasActive = true
  }
  if (!hasActive)
    return undefined

  return important + [...variants.filter(v => !facets.active.has(v)), utility].join(':')
}

/**
 * Returns the range to remove for a dropped token: the token plus the
 * whitespace after it, or the spaces before it when the token ends its list.
 * Newlines before a last token are kept, so the closing line stays indented.
 */
function removalRange(code: string, start: number, end: number): [number, number] {
  let after = end
  while (after < code.length && /\s/.test(code[after]))
    after++
  if (after > end)
    return [start, after]

  let before = start
  while (before > 0 && /[ \t]/.test(code[before - 1]))
    before--
  return [before, end]
}

/**
 * Build-time themes: keeps the classes of the active value of each theme
 * facet and removes the classes of every other value from the source, before
 * HTML and CSS are compiled.
 *
 * `acme:c-red` becomes `c-red` when `acme` is active, and is removed from the
 * markup entirely when it is not.
 *
 * @see https://unocss.dev/transformers/build-themes
 */
export default function transformerBuildThemes(options: TransformerBuildThemesOptions): SourceCodeTransformer {
  const facets = resolveFacets(options)
  const names = facets.values.map(escapeRegExp).join('|')
  const prefixRE = new RegExp(`(?:^|[^\\w-])(?:${names}):`)
  const checked = new WeakSet<UnoGenerator<any>>()

  const transformer: SourceCodeTransformer = {
    name: TRANSFORMER_NAME,
    docs: 'https://unocss.dev/transformers/build-themes',
    enforce: 'pre',
    codeFilter: code => prefixRE.test(code),
    async transform(s, _id, ctx) {
      const uno = ctx?.uno
      if (uno && !checked.has(uno)) {
        checked.add(uno)
        assertTransformerOrder(uno, transformer)
        await assertNoVariantCollision(uno, facets.values)
      }

      const code = s.original
      const edits: Edit[] = []

      // Variant groups that mention a facet value are expanded, so that each item is
      // resolved on its own: `hover:(acme:a globex:b)` -> `hover:a`. Both
      // separators of `transformerVariantGroup` are handled, so that
      // `globex:bg-(red blue)` is removed whole whichever transformer runs first.
      const groupRanges: [number, number][] = []
      if (code.includes(':(') || code.includes('-(')) {
        const { groupsByOffset } = parseVariantGroup(code, [':', '-'])
        for (const [offset, group] of [...groupsByOffset].sort(([a], [b]) => a - b)) {
          const end = offset + group.length
          const text = code.slice(offset, end)
          if (!prefixRE.test(code.slice(Math.max(0, offset - 1), end)))
            continue
          // `acme:bg-(--accent)` is a CSS variable value, not a group. If
          // `transformerVariantGroup` runs later, it expands it the same way.
          if (group.items.length < 2 && groupSeparator(text) === '-')
            continue
          groupRanges.push([offset, end])

          const kept: string[] = []
          for (const item of group.items) {
            const resolved = resolveClass(item.className, facets)
            if (resolved !== null)
              kept.push(resolved ?? item.className)
          }
          edits.push({ start: offset, end, value: kept.length ? kept.join(' ') : null })
        }
      }

      let groupIndex = 0
      // The end of an attribute removed whole; tokens in its value are skipped.
      let skipUntil = 0
      for (const [start, end] of scanTokens(code)) {
        if (start < skipUntil)
          continue
        while (groupIndex < groupRanges.length && groupRanges[groupIndex][1] <= start)
          groupIndex++
        const group = groupRanges[groupIndex]
        if (group && start < group[1] && end > group[0])
          continue

        const token = code.slice(start, end)
        if (!prefixRE.test(token))
          continue

        // An attributify attribute with facet values in its name, such as
        // `acme:text="red"`: the active values leave the name, and an inactive
        // one removes the attribute with its value.
        const quote = code[end]
        if (token.endsWith('=') && (quote === '"' || quote === '\'')) {
          const close = code.indexOf(quote, end + 1)
          const resolved = close < 0 ? undefined : resolveClass(token.slice(0, -1), facets)
          if (resolved === null) {
            edits.push({ start, end: close + 1, value: null })
            skipUntil = close + 1
          }
          else if (resolved !== undefined) {
            edits.push({ start, end: end - 1, value: resolved })
          }
          continue
        }

        const resolved = resolveClass(token, facets)
        if (resolved !== undefined)
          edits.push({ start, end, value: resolved })
      }

      await removeEmptied(code, edits, async (name) => {
        if (!uno?.config.presets.some(preset => preset.name === '@unocss/preset-attributify'))
          return false
        return !!(await uno.parseToken(name))
      })

      // Applied in source order, so that consecutive removed classes form one
      // range and the last class of a list can take the space before the first.
      edits.sort((a, b) => a.start - b.start)
      let removedStart = -1
      let removedEnd = -1
      for (const { start, end, value } of edits) {
        if (value !== null) {
          s.overwrite(start, end, value)
          continue
        }
        const [from, to] = removalRange(code, start === removedEnd ? removedStart : start, end)
        s.remove(from, to)
        removedStart = from
        removedEnd = to
      }
    },
  }
  return transformer
}

interface Edit {
  start: number
  end: number
  /** `null` removes the range, a string replaces it. */
  value: string | null
}

/**
 * Places that hold a class list, with the list in the group named `body`:
 *
 * - quoted attribute values, only where an attribute can be: after whitespace,
 *   and before whitespace, `/` or `>`. Unformatted code such as `x="...";`
 *   does not match;
 * - `@apply` statements and custom property declarations such as
 *   `--at-apply: ...`, up to their `;`, the closing `}` of the block, or the
 *   end of the code.
 */
const ATTRIBUTE_RE = /(?<=\s)(?<name>[^\s"'`=<>/{}()]+)=(?:"(?<double>[^"]*)"|'(?<single>[^']*)')(?=[\s/>]|$)/dg
const STATEMENT_RE = /(?:@apply\b|--[\w-]+\s*:)(?<body>[^;{}]*)(?:;|(?=\})|$)/dg

/** Attribute names that bind an expression or an event rather than a value. */
const BINDING_RE = /^(?:[:@#]|v-bind:|v-on:)/

/**
 * Replaces the edits of a statement or attribute whose classes are all
 * removed with one removal of the whole statement or attribute.
 *
 * An empty `@apply;` or `--at-apply: "";` would pass through
 * `transformerDirectives`, so emptied statements are always removed. An empty
 * attribute is only removed when `isUtilityAttribute` says attributify would
 * read it as a utility (`border=""` is `border`): anywhere else, removing it
 * could change meaning, as a component prop would fall back to its default.
 * Containers that keep anything besides whitespace and quotes are left alone.
 */
async function removeEmptied(code: string, edits: Edit[], isUtilityAttribute: (name: string) => Promise<boolean>) {
  if (!edits.some(edit => edit.value === null))
    return

  // Edits never overlap, so sorted by start they are also sorted by end.
  edits.sort((a, b) => a.start - b.start)
  const editsWithin = (start: number, end: number): Edit[] => {
    let low = 0
    let high = edits.length
    while (low < high) {
      const middle = (low + high) >> 1
      if (edits[middle].start < start)
        low = middle + 1
      else
        high = middle
    }
    const within: Edit[] = []
    for (let i = low; i < edits.length && edits[i].end <= end; i++)
      within.push(edits[i])
    return within
  }

  const replaced = new Set<Edit>()
  const removals: Edit[] = []
  for (const re of [ATTRIBUTE_RE, STATEMENT_RE]) {
    for (const match of code.matchAll(re)) {
      const groups = match.indices!.groups!
      const [bodyStart, bodyEnd] = (groups.double ?? groups.single ?? groups.body)!
      const inside = editsWithin(bodyStart, bodyEnd)
      if (!inside.length || inside.some(edit => edit.value !== null || replaced.has(edit)))
        continue

      let remaining = ''
      let at = bodyStart
      for (const edit of inside) {
        remaining += code.slice(at, edit.start)
        at = edit.end
      }
      remaining += code.slice(at, bodyEnd)
      if (/[^\s"']/.test(remaining))
        continue

      const name = match.groups!.name
      if (name !== undefined && (BINDING_RE.test(name) || !await isUtilityAttribute(name)))
        continue

      // Whitespace before a closing `}` is left to the removal range, so that
      // a statement at the end of a block keeps the space before it.
      const start = match.index!
      const end = start + match[0].trimEnd().length
      for (const edit of editsWithin(start, end))
        replaced.add(edit)
      removals.push({ start, end, value: null })
    }
  }

  if (!removals.length)
    return
  let kept = 0
  for (const edit of edits) {
    if (!replaced.has(edit))
      edits[kept++] = edit
  }
  edits.length = kept
  for (const removal of removals)
    edits.push(removal)
}

/**
 * Transformers that read classes. Running before this one, they would see
 * every theme's classes: compiling inactive ones into the CSS, or turning
 * `<div acme:c-red>` into an attribute this transformer leaves alone.
 */
const MUST_RUN_AFTER = new Set([
  '@unocss/transformer-attributify-jsx',
  '@unocss/transformer-compile-class',
  '@unocss/transformer-directives',
])

function assertTransformerOrder(uno: UnoGenerator<any>, self: SourceCodeTransformer) {
  const transformers = uno.config.transformers ?? []
  const index = transformers.indexOf(self)
  if (index < 0)
    return
  const before = transformers
    .slice(0, index)
    .filter(t => (t.enforce ?? 'default') === 'pre' && MUST_RUN_AFTER.has(t.name))
  if (before.length) {
    throw new Error(
      `[transformer-build-themes] ${before.map(t => `"${t.name}"`).join(', ')} must come after transformerBuildThemes() in \`transformers\`, `
      + 'or it sees the classes of every theme.',
    )
  }
}

async function assertNoVariantCollision(uno: UnoGenerator<any>, names: string[]) {
  const collisions: string[] = []
  for (const name of names) {
    const probe = `${name}:build-themes-probe`
    const results = await uno.matchVariants(probe)
    const foreign = results
      .flatMap(([, , , variants]) => [...variants])
      .filter(variant => !variant.name?.startsWith(VARIANT_NAME_PREFIX))
    if (foreign.length)
      collisions.push(`"${name}" (matched by variant ${foreign.map(v => `"${v.name ?? 'anonymous'}"`).join(', ')})`)
  }
  if (collisions.length) {
    throw new Error(
      `[transformer-build-themes] Facet values collide with registered variants: ${collisions.join('; ')}. `
      + 'The transformer would strip those variants from your classes. Rename those values.',
    )
  }
}

/**
 * Registers every facet value as a no-op variant, so that editor tooling
 * (VS Code extension, `@unocss/eslint-plugin`) recognizes `acme:c-red` in
 * source. The transformer has already removed the prefixes by the time CSS
 * is generated in a build.
 */
export function variantBuildThemes(options: TransformerBuildThemesOptions): Variant[] {
  return resolveFacets(options).values.map((name): Variant => {
    const prefix = `${name}:`
    return {
      name: `${VARIANT_NAME_PREFIX}${name}`,
      match: matcher => matcher.startsWith(prefix) ? { matcher: matcher.slice(prefix.length) } : undefined,
    }
  })
}
