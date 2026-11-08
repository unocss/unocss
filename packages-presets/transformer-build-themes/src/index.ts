import type { SourceCodeTransformer, UnoGenerator, Variant } from '@unocss/core'
import { escapeRegExp, parseVariantGroup } from '@unocss/core'

export interface TransformerBuildThemesOptions {
  /**
   * Theme names, grouped by axis. Each group is independent: one theme per
   * group is active in a build, and the others are removed.
   *
   * @example
   * ```ts
   * {
   *   client: ['acme', 'globex'],
   *   scheme: ['day', 'night'],
   * }
   * ```
   */
  themes: Record<string, readonly string[]>

  /**
   * The active theme of every group in `themes`, resolved by the caller
   * (for example from an environment variable in a CI build matrix).
   *
   * @example
   * ```ts
   * { client: 'acme', scheme: 'night' }
   * ```
   */
  active: Record<string, string>
}

interface ResolvedThemes {
  active: Set<string>
  inactive: Set<string>
  all: string[]
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
 * Finds class-like tokens: runs of characters between terminators, with
 * bracketed arbitrary values (`[&_a]`, `content-['a b']`), parenthesized
 * values (`bg-(--accent)`) and escaped characters (`\:`) kept inside the token.
 */
function* scanTokens(code: string): Generator<[start: number, end: number]> {
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
        const close = closeBracket(code, end)
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

function resolveThemes(options: TransformerBuildThemesOptions): ResolvedThemes {
  const { themes, active } = options ?? {}
  if (!themes || typeof themes !== 'object' || !Object.keys(themes).length)
    throw new Error('[transformer-build-themes] `themes` must define at least one group.')
  if (!active || typeof active !== 'object')
    throw new Error('[transformer-build-themes] `active` must name the active theme of every group.')

  const seen = new Map<string, string>()
  const activeSet = new Set<string>()
  const inactiveSet = new Set<string>()

  for (const [group, names] of Object.entries(themes)) {
    if (!Array.isArray(names) || !names.length)
      throw new Error(`[transformer-build-themes] Group "${group}" must list at least one theme.`)

    for (const name of names) {
      if (!NAME_RE.test(name))
        throw new Error(`[transformer-build-themes] Invalid theme name "${name}" in group "${group}": use letters, digits, "-" or "_", starting with a letter.`)
      const owner = seen.get(name)
      if (owner !== undefined)
        throw new Error(`[transformer-build-themes] Theme "${name}" is listed in both "${owner}" and "${group}". Theme names must be unique across groups.`)
      seen.set(name, group)
    }

    const current = active[group]
    if (current === undefined)
      throw new Error(`[transformer-build-themes] No active theme for group "${group}". Expected one of: ${names.join(', ')}.`)
    if (!names.includes(current))
      throw new Error(`[transformer-build-themes] Active theme "${current}" is not listed in group "${group}". Expected one of: ${names.join(', ')}.`)

    for (const name of names)
      (name === current ? activeSet : inactiveSet).add(name)
  }

  for (const group of Object.keys(active)) {
    if (!(group in themes))
      throw new Error(`[transformer-build-themes] \`active\` names group "${group}", which is not defined in \`themes\`.`)
  }

  return { active: activeSet, inactive: inactiveSet, all: [...seen.keys()] }
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
 * Resolves one class against the build's themes.
 *
 * @returns the class with active theme prefixes removed, `null` when the class
 * belongs to an inactive theme, or `undefined` when the class is left as is.
 */
function resolveClass(token: string, themes: ResolvedThemes): string | null | undefined {
  const important = token.startsWith('!') ? '!' : ''
  const segments = splitSegments(important ? token.slice(1) : token)
  if (segments.length < 2)
    return undefined

  const utility = segments.at(-1)!
  const variants = segments.slice(0, -1)

  // `acme: true`, `acme://host` and `a::b` are not classes. `acme:bg="red"` is
  // an attributify attribute, which this transformer does not rewrite: removing
  // the name would leave its value behind.
  if (!utility || utility.startsWith('/') || utility.endsWith('=') || variants.some(v => !v))
    return undefined

  let hasTheme = false
  for (const variant of variants) {
    if (themes.inactive.has(variant))
      return null
    if (themes.active.has(variant))
      hasTheme = true
  }
  if (!hasTheme)
    return undefined

  return important + [...variants.filter(v => !themes.active.has(v)), utility].join(':')
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
 * Build-time themes: keeps the classes of each group's active theme and
 * removes every other theme's classes from the source, before HTML and CSS
 * are compiled.
 *
 * `acme:c-red` becomes `c-red` when `acme` is active, and is removed from the
 * markup entirely when it is not.
 *
 * @see https://unocss.dev/transformers/build-themes
 */
export default function transformerBuildThemes(options: TransformerBuildThemesOptions): SourceCodeTransformer {
  const themes = resolveThemes(options)
  const names = themes.all.map(escapeRegExp).join('|')
  const themeRE = new RegExp(`(?:^|[^\\w-])(?:${names}):`)
  const checked = new WeakSet<UnoGenerator<any>>()

  const transformer: SourceCodeTransformer = {
    name: TRANSFORMER_NAME,
    docs: 'https://unocss.dev/transformers/build-themes',
    enforce: 'pre',
    codeFilter: code => themeRE.test(code),
    async transform(s, _id, ctx) {
      const uno = ctx?.uno
      if (uno && !checked.has(uno)) {
        checked.add(uno)
        assertTransformerOrder(uno, transformer)
        await assertNoVariantCollision(uno, themes.all)
      }

      const code = s.original
      // `null` removes the range, a string replaces it.
      const edits: { start: number, end: number, value: string | null }[] = []

      // Variant groups that mention a theme are expanded, so that each item is
      // resolved on its own: `hover:(acme:a globex:b)` -> `hover:a`. Both
      // separators of `transformerVariantGroup` are handled, so that
      // `globex:bg-(red blue)` is removed whole whichever transformer runs first.
      const groupRanges: [number, number][] = []
      if (code.includes(':(') || code.includes('-(')) {
        const { groupsByOffset } = parseVariantGroup(code, [':', '-'])
        for (const [offset, group] of [...groupsByOffset].sort(([a], [b]) => a - b)) {
          const end = offset + group.length
          const text = code.slice(offset, end)
          if (!themeRE.test(code.slice(Math.max(0, offset - 1), end)))
            continue
          // `acme:bg-(--accent)` is a CSS variable value, not a group. If
          // `transformerVariantGroup` runs later, it expands it the same way.
          if (group.items.length < 2 && groupSeparator(text) === '-')
            continue
          groupRanges.push([offset, end])

          const kept: string[] = []
          for (const item of group.items) {
            const resolved = resolveClass(item.className, themes)
            if (resolved !== null)
              kept.push(resolved ?? item.className)
          }
          edits.push({ start: offset, end, value: kept.length ? kept.join(' ') : null })
        }
      }

      let groupIndex = 0
      for (const [start, end] of scanTokens(code)) {
        while (groupIndex < groupRanges.length && groupRanges[groupIndex][1] <= start)
          groupIndex++
        const group = groupRanges[groupIndex]
        if (group && start < group[1] && end > group[0])
          continue

        const token = code.slice(start, end)
        if (!themeRE.test(token))
          continue

        const resolved = resolveClass(token, themes)
        if (resolved !== undefined)
          edits.push({ start, end, value: resolved })
      }

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
      `[transformer-build-themes] Theme names collide with registered variants: ${collisions.join('; ')}. `
      + 'The transformer would strip those variants from your classes. Rename the themes.',
    )
  }
}

/**
 * Registers every theme name as a no-op variant, so that editor tooling
 * (VS Code extension, `@unocss/eslint-plugin`) recognizes `acme:c-red` in
 * source. The transformer has already removed the prefixes by the time CSS
 * is generated in a build.
 */
export function variantBuildThemes(options: TransformerBuildThemesOptions): Variant[] {
  return resolveThemes(options).all.map((name): Variant => {
    const prefix = `${name}:`
    return {
      name: `${VARIANT_NAME_PREFIX}${name}`,
      match: matcher => matcher.startsWith(prefix) ? { matcher: matcher.slice(prefix.length) } : undefined,
    }
  })
}
