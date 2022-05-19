import type { VariantObject } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'
import type { PresetMiniOptions } from '..'

const PseudoClasses: Record<string, string> = Object.fromEntries([
  // pseudo elements part 1
  ['first-letter', '::first-letter'],
  ['first-line', '::first-line'],

  // location
  'any-link',
  'link',
  'visited',
  'target',
  ['open', '[open]'],

  // user action
  'hover',
  'active',
  'focus-visible',
  'focus-within',
  'focus',

  // input
  'autofill',
  'enabled',
  'disabled',
  'read-only',
  'read-write',
  'placeholder-shown',
  'default',
  'checked',
  'indeterminate',
  'valid',
  'invalid',
  'in-range',
  'out-of-range',
  'required',
  'optional',

  // tree-structural
  'root',
  'empty',
  ['even-of-type', ':nth-of-type(even)'],
  ['even', ':nth-child(even)'],
  ['odd-of-type', ':nth-of-type(odd)'],
  ['odd', ':nth-child(odd)'],
  'first-of-type',
  ['first', ':first-child'],
  'last-of-type',
  ['last', ':last-child'],
  'only-child',
  'only-of-type',

  // pseudo elements part 2
  ['placeholder', '::placeholder'],
  ['before', '::before'],
  ['after', '::after'],
  ['selection', '::selection'],
  ['marker', '::marker'],
  ['file', '::file-selector-button'],
].map(key => typeof key === 'string' ? [key, `:${key}`] : key))

const PseudoClassFunctions = [
  'not',
  'is',
  'where',
  'has',
]

const PseudoClassesStr = Object.entries(PseudoClasses).filter(([, pseudo]) => !pseudo.startsWith('::')).map(([key]) => key).join('|')
const PseudoClassFunctionsStr = PseudoClassFunctions.join('|')

const sortValue = (pseudo: string) => {
  if (pseudo === 'active')
    return 1
}

const taggedPseudoClassMatcher = (tag: string, parent: string, combinator: string): VariantObject => {
  const re = new RegExp(`^${tag}-((?:(${PseudoClassFunctionsStr})-)?(${PseudoClassesStr}))[:-]`)
  const rawRe = new RegExp(`^${escapeRegExp(parent)}:`)
  return {
    name: `pseudo:${tag}`,
    match(input: string) {
      const match = input.match(re)
      if (match) {
        let pseudo = PseudoClasses[match[3]] || `:${match[3]}`
        if (match[2])
          pseudo = `:${match[2]}(${pseudo})`
        return {
          matcher: input.slice(match[0].length),
          selector: s => rawRe.test(s)
            ? s.replace(rawRe, `${parent}${pseudo}:`)
            : `${parent}${pseudo}${combinator}${s}`,
          sort: sortValue(match[3]),
        }
      }
    },
  }
}

const PseudoClassesAndElementsStr = Object.entries(PseudoClasses).map(([key]) => key).join('|')
const PseudoClassesAndElementsRE = new RegExp(`^(${PseudoClassesAndElementsStr})[:-]`)
export const variantPseudoClassesAndElements: VariantObject = {
  name: 'pseudo',
  match: (input: string) => {
    const match = input.match(PseudoClassesAndElementsRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || `:${match[1]}`
      return {
        matcher: input.slice(match[0].length),
        selector: s => `${s}${pseudo}`,
        sort: sortValue(match[1]),
      }
    }
  },
  multiPass: true,
  autocomplete: `(${PseudoClassesAndElementsStr}):`,
}

const PseudoClassFunctionsRE = new RegExp(`^(${PseudoClassFunctionsStr})-(${PseudoClassesStr})[:-]`)
export const variantPseudoClassFunctions: VariantObject = {
  match: (input: string) => {
    const match = input.match(PseudoClassFunctionsRE)
    if (match) {
      const fn = match[1]
      const pseudo = PseudoClasses[match[2]] || `:${match[2]}`
      return {
        matcher: input.slice(match[0].length),
        selector: s => `${s}:${fn}(${pseudo})`,
      }
    }
  },
  multiPass: true,
  autocomplete: `(${PseudoClassFunctionsStr})-(${PseudoClassesStr}):`,
}

export const variantTaggedPseudoClasses = (options: PresetMiniOptions = {}): VariantObject[] => {
  const attributify = !!options?.attributifyPseudo

  return [
    {
      ...taggedPseudoClassMatcher('group', attributify ? '[group=""]' : '.group', ' '),
      multiPass: true,
    },
    {
      ...taggedPseudoClassMatcher('peer', attributify ? '[peer=""]' : '.peer', '~'),
      multiPass: true,
    },
    {
      ...taggedPseudoClassMatcher('parent', attributify ? '[parent=""]' : '.parent', '>'),
      multiPass: true,
    },
    {
      ...taggedPseudoClassMatcher('previous', attributify ? '[previous=""]' : '.previous', '+'),
      multiPass: true,
    },
  ]
}

const PartClassesRE = /(part-\[(.+)]:)(.+)/
export const partClasses: VariantObject = {
  match: (input: string) => {
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
