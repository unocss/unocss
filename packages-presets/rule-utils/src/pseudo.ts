import type { VariantObject } from '@unocss/core'
import type { getBracket } from './utilities'
import type { variantGetBracket } from './variants'
import { escapeRegExp, escapeSelector } from '@unocss/core'

const PseudoPlaceholder = '__pseudo_placeholder__'

/**
 * Note: the order of following pseudo classes will affect the order of generated css.
 *
 * Reference: https://github.com/tailwindlabs/tailwindcss/blob/main/src/corePlugins.js#L83
 */
export const PseudoClasses: Record<string, string> = Object.fromEntries([
  // pseudo elements part 1
  ['first-letter', '::first-letter'],
  ['first-line', '::first-line'],

  // location
  'any-link',
  'link',
  'visited',
  'target',
  ['open', '[open]'],

  // forms
  'default',
  'checked',
  'indeterminate',
  'placeholder-shown',
  'autofill',
  'optional',
  'required',
  'valid',
  'invalid',
  'user-valid',
  'user-invalid',
  'in-range',
  'out-of-range',
  'read-only',
  'read-write',

  // content
  'empty',

  // interactions
  'focus-within',
  'hover',
  'focus',
  'focus-visible',
  'active',
  'enabled',
  'disabled',
  'popover-open',

  // tree-structural
  'root',
  'empty',
  ['even-of-type', ':nth-of-type(even)'],
  ['even', ':nth-child(even)'],
  ['odd-of-type', ':nth-of-type(odd)'],
  ['odd', ':nth-child(odd)'],
  ['nth', `:nth-child(${PseudoPlaceholder})`],
  'first-of-type',
  ['first', ':first-child'],
  'last-of-type',
  ['last', ':last-child'],
  'only-child',
  'only-of-type',

  // pseudo elements part 2
  ['backdrop-element', '::backdrop'],
  ['placeholder', '::placeholder'],
  ['before', '::before'],
  ['after', '::after'],
  ['file', '::file-selector-button'],
].map(key => Array.isArray(key) ? key : [key, `:${key}`]))

export const PseudoClassesKeys = Object.keys(PseudoClasses)

export const PseudoClassesColon: Record<string, string> = Object.fromEntries([
  ['backdrop', '::backdrop'],
].map(key => Array.isArray(key) ? key : [key, `:${key}`]))

export const PseudoClassesColonKeys = Object.keys(PseudoClassesColon)

export const PseudoClassFunctions = [
  'not',
  'is',
  'where',
  'has',
]

export const PseudoClassesMulti: Record<string, string[]> = Object.fromEntries([
  ['selection', ['::selection', ' *::selection']],
  ['marker', ['::marker', ' *::marker']],
])

export const PseudoClassesStr = Object.entries(PseudoClasses)
  .filter(([, pseudo]) => !pseudo.startsWith('::'))
  .map(([key]) => key)
  .sort((a, b) => b.length - a.length)
  .join('|')
export const PseudoClassesColonStr = Object.entries(PseudoClassesColon)
  .filter(([, pseudo]) => !pseudo.startsWith('::'))
  .map(([key]) => key)
  .sort((a, b) => b.length - a.length)
  .join('|')
export const PseudoClassFunctionsStr = PseudoClassFunctions.join('|')
export const PseudoClassesMultiStr = Object.keys(PseudoClassesMulti).sort((a, b) => b.length - a.length).join('|')

export const excludedPseudo = [
  '::-webkit-resizer',
  '::-webkit-scrollbar',
  '::-webkit-scrollbar-button',
  '::-webkit-scrollbar-corner',
  '::-webkit-scrollbar-thumb',
  '::-webkit-scrollbar-track',
  '::-webkit-scrollbar-track-piece',
  '::file-selector-button',
]

export const PseudoClassesAndElementsStr = Object.entries(PseudoClasses)
  .map(([key]) => key)
  .sort((a, b) => b.length - a.length)
  .join('|')
export const PseudoClassesAndElementsColonStr = Object.entries(PseudoClassesColon)
  .map(([key]) => key)
  .sort((a, b) => b.length - a.length)
  .join('|')

export interface PseudoVariantOptions {
  /**
   * Generate tagged pseudo selector as `[group=""]` instead of `.group`
   *
   * @default false
   */
  attributifyPseudo?: boolean
  /**
   * Utils prefix
   */
  prefix?: string | string[]
}

export interface PseudoVariantUtilities {
  getBracket: typeof getBracket
  h: {
    bracket: (s: string) => string | undefined
  }
  variantGetBracket: typeof variantGetBracket
}

export function createTaggedPseudoClassMatcher<T extends object = object>(
  tag: string,
  parent: string,
  combinator: string,
  utils: PseudoVariantUtilities,
): VariantObject<T> {
  const { h, variantGetBracket } = utils
  const rawRE = new RegExp(`^(${escapeRegExp(parent)}:)(\\S+)${escapeRegExp(combinator)}\\1`)
  let splitRE: RegExp
  let pseudoRE: RegExp
  let pseudoColonRE: RegExp
  let pseudoVarRE: RegExp

  const matchBracket = (input: string): [label: string, rest: string, prefix: string] | undefined => {
    const body = variantGetBracket(`${tag}-`, input, [])
    if (!body)
      return

    const [match, rest] = body
    const bracketValue = h.bracket(match)
    if (bracketValue == null)
      return

    const label = rest.split(splitRE, 1)?.[0] ?? ''
    const prefix = `${parent}${escapeSelector(label)}`
    return [
      label,
      input.slice(input.length - (rest.length - label.length - 1)),
      bracketValue.includes('&') ? bracketValue.replace(/&/g, prefix) : `${prefix}${bracketValue}`,
    ]
  }

  const matchPseudo = (input: string): [label: string, rest: string, prefix: string, pseudoKey: string] | undefined => {
    const match = input.match(pseudoRE) || input.match(pseudoColonRE)
    if (!match)
      return

    const [original, fn, pseudoKey] = match
    const label = match[3] ?? ''
    let pseudo = PseudoClasses[pseudoKey] || PseudoClassesColon[pseudoKey] || `:${pseudoKey}`
    if (fn)
      pseudo = `:${fn}(${pseudo})`

    return [
      label,
      input.slice(original.length),
      `${parent}${escapeSelector(label)}${pseudo}`,
      pseudoKey,
    ]
  }

  const matchPseudoVar = (input: string): [label: string, rest: string, prefix: string] | undefined => {
    const match = input.match(pseudoVarRE)
    if (!match)
      return
    const [original, fn, pseudoValue] = match
    const label = match[3] ?? ''
    const pseudo = `:${fn}(${pseudoValue})`

    return [
      label,
      input.slice(original.length),
      `${parent}${escapeSelector(label)}${pseudo}`,
    ]
  }

  return {
    name: `pseudo:${tag}`,
    match(input, ctx) {
      if (!(splitRE && pseudoRE && pseudoColonRE)) {
        splitRE = new RegExp(`(?:${ctx.generator.config.separators.join('|')})`)
        pseudoRE = new RegExp(`^${tag}-(?:(?:(${PseudoClassFunctionsStr})-)?(${PseudoClassesStr}))(?:(/[\\w-]+))?(?:${ctx.generator.config.separators.join('|')})`)
        pseudoColonRE = new RegExp(`^${tag}-(?:(?:(${PseudoClassFunctionsStr})-)?(${PseudoClassesColonStr}))(?:(/[\\w-]+))?(?:${ctx.generator.config.separators.filter(x => x !== '-').join('|')})`)
        pseudoVarRE = new RegExp(`^${tag}-(?:(${PseudoClassFunctionsStr})-)?\\[(.+)\\](?:(/[\\w-]+))?(?:${ctx.generator.config.separators.filter(x => x !== '-').join('|')})`)
      }

      if (!input.startsWith(tag))
        return

      const result = matchBracket(input) || matchPseudo(input) || matchPseudoVar(input)
      if (!result)
        return

      const [_label, matcher, prefix, pseudoName = ''] = result

      return {
        matcher,
        handle: (input, next) => next({
          ...input,
          prefix: `${prefix}${combinator}${input.prefix}`.replace(rawRE, '$1$2:'),
          sort: PseudoClassesKeys.indexOf(pseudoName) ?? PseudoClassesColonKeys.indexOf(pseudoName),
        }),
      }
    },
    multiPass: true,
  }
}

export function createPseudoClassesAndElements<T extends object = object>(utils: PseudoVariantUtilities): VariantObject<T>[] {
  const { h } = utils
  let PseudoClassesAndElementsRE: RegExp
  let PseudoClassesAndElementsColonRE: RegExp
  let PseudoClassesMultiRE: RegExp

  return [
    {
      name: 'pseudo',
      match(input, ctx) {
        if (!(PseudoClassesAndElementsRE && PseudoClassesAndElementsColonRE)) {
          PseudoClassesAndElementsRE = new RegExp(`^(${PseudoClassesAndElementsStr})(?:-(\\d+|\\[\\w+\\]))?(?:${ctx.generator.config.separators.join('|')})`)
          PseudoClassesAndElementsColonRE = new RegExp(`^(${PseudoClassesAndElementsColonStr})(?:${ctx.generator.config.separators.filter(x => x !== '-').join('|')})`)
        }

        const match = input.match(PseudoClassesAndElementsRE) || input.match(PseudoClassesAndElementsColonRE)
        if (match) {
          let pseudo = PseudoClasses[match[1]] || PseudoClassesColon[match[1]] || `:${match[1]}`
          if (match[2]) {
            let anPlusB: string | undefined
            if (match[2].startsWith('[') && match[2].endsWith(']')) {
              // Handle bracket notation like [2n+1] or [odd]
              anPlusB = h.bracket(match[2])
            }
            else {
              // Handle simple numeric notation like 2, 3, etc.
              anPlusB = match[2]
            }
            if (anPlusB) {
              pseudo = pseudo.replace(PseudoPlaceholder, anPlusB)
            }
          }

          // order of pseudo classes
          let index: number | undefined = PseudoClassesKeys.indexOf(match[1])
          if (index === -1)
            index = PseudoClassesColonKeys.indexOf(match[1])
          if (index === -1)
            index = undefined

          return {
            matcher: input.slice(match[0].length),
            handle: (input, next) => {
              const selectors = (pseudo.includes('::') && !excludedPseudo.includes(pseudo))
                ? {
                    pseudo: `${input.pseudo}${pseudo}`,
                  }
                : {
                    selector: `${input.selector}${pseudo}`,
                  }

              return next({
                ...input,
                ...selectors,
                sort: index,
                noMerge: true,
              })
            },
          }
        }
      },
      multiPass: true,
      autocomplete: `(${PseudoClassesAndElementsStr}|${PseudoClassesAndElementsColonStr}):`,
    },
    {
      name: 'pseudo:multi',
      match(input, ctx) {
        if (!PseudoClassesMultiRE) {
          PseudoClassesMultiRE = new RegExp(`^(${PseudoClassesMultiStr})(?:${ctx.generator.config.separators.join('|')})`)
        }

        const match = input.match(PseudoClassesMultiRE)
        if (match) {
          const pseudos = PseudoClassesMulti[match[1]]
          return pseudos.map((pseudo) => {
            return {
              matcher: input.slice(match[0].length),
              handle: (input, next) => next({
                ...input,
                pseudo: `${input.pseudo}${pseudo}`,
              }),
            }
          })
        }
      },
      multiPass: false,
      autocomplete: `(${PseudoClassesMultiStr}):`,
    },
  ]
}

export function createPseudoClassFunctions<T extends object = object>(utils: PseudoVariantUtilities): VariantObject<T> {
  const { getBracket, h } = utils
  let PseudoClassFunctionsRE: RegExp
  let PseudoClassColonFunctionsRE: RegExp
  let PseudoClassVarFunctionRE: RegExp
  return {
    match(input, ctx) {
      if (!(PseudoClassFunctionsRE && PseudoClassColonFunctionsRE)) {
        PseudoClassFunctionsRE = new RegExp(`^(${PseudoClassFunctionsStr})-(${PseudoClassesStr})(?:${ctx.generator.config.separators.join('|')})`)
        PseudoClassColonFunctionsRE = new RegExp(`^(${PseudoClassFunctionsStr})-(${PseudoClassesColonStr})(?:${ctx.generator.config.separators.filter(x => x !== '-').join('|')})`)
        PseudoClassVarFunctionRE = new RegExp(`^(${PseudoClassFunctionsStr})-(\\[.+\\])(?:${ctx.generator.config.separators.filter(x => x !== '-').join('|')})`)
      }

      const match = input.match(PseudoClassFunctionsRE) || input.match(PseudoClassColonFunctionsRE) || input.match(PseudoClassVarFunctionRE)
      if (match) {
        const fn = match[1]
        const fnVal = getBracket(match[2], '[', ']')
        const pseudo = fnVal ? h.bracket(match[2]) : (PseudoClasses[match[2]] || PseudoClassesColon[match[2]] || `:${match[2]}`)
        return {
          matcher: input.slice(match[0].length),
          selector: s => `${s}:${fn}(${pseudo})`,
        }
      }
    },
    multiPass: true,
    autocomplete: `(${PseudoClassFunctionsStr})-(${PseudoClassesStr}|${PseudoClassesColonStr}):`,
  }
}

export function createTaggedPseudoClasses<T extends object = object>(
  options: PseudoVariantOptions,
  utils: PseudoVariantUtilities,
): VariantObject<T>[] {
  const attributify = !!options?.attributifyPseudo
  let firstPrefix = options?.prefix ?? ''
  firstPrefix = (Array.isArray(firstPrefix) ? firstPrefix : [firstPrefix]).filter(Boolean)[0] ?? ''
  const tagWithPrefix = (tag: string, combinator: string) => createTaggedPseudoClassMatcher<T>(tag, attributify ? `[${firstPrefix}${tag}=""]` : `.${firstPrefix}${tag}`, combinator, utils)

  return [
    tagWithPrefix('group', ' '),
    tagWithPrefix('peer', '~'),
    tagWithPrefix('parent', '>'),
    tagWithPrefix('previous', '+'),
  ]
}

const PartClassesRE = /(part-\[(.+)\]:)(.+)/

export function createPartClasses<T extends object = object>(): VariantObject<T> {
  return {
    match(input) {
      const match = input.match(PartClassesRE)
      if (match) {
        const part = `part(${match[2]})`
        return {
          matcher: input.slice(match[1].length),
          selector: s => `${s}::${part}`,
        }
      }
    },
    multiPass: true,
  }
}
