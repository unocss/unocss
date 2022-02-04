import type { VariantFunction, VariantHandler, VariantObject } from '@unocss/core'
import { escapeRegExp, toArray } from '@unocss/core'
import type { PresetMiniOptions } from '..'

const PseudoClasses: Record<string, string | undefined> = Object.fromEntries([
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
].map(toArray))

const PseudoElements: Record<string, string | undefined> = Object.fromEntries([
  'placeholder',
  'before',
  'after',
  'first-letter',
  'first-line',
  'selection',
  'marker',
  ['file', '::file-selector-button'],
].map(toArray))

const PseudoClassFunctions = [
  'not',
  'is',
  'where',
  'has',
]

const PseudoElementsStr = Object.keys(PseudoElements).join('|')
const PseudoClassesStr = Object.keys(PseudoClasses).join('|')
const PseudoClassFunctionsStr = PseudoClassFunctions.join('|')

const PartClassesRE = /(part-\[(.+)]:)(.+)/
const PseudoElementsRE = new RegExp(`^(${PseudoElementsStr})[:-]`)
const PseudoClassesRE = new RegExp(`^(${PseudoClassesStr})[:-]`)
const PseudoClassFunctionsRE = new RegExp(`^(${PseudoClassFunctionsStr})-(${PseudoClassesStr})[:-]`)

const taggedPseudoClassMatcher = (tag: string, parent: string, combinator: string) => {
  const re = new RegExp(`^${tag}-((?:(${PseudoClassFunctionsStr})-)?(${PseudoClassesStr}))[:-]`)
  const rawRe = new RegExp(`^${escapeRegExp(parent)}:`)
  return (input: string): VariantHandler | undefined => {
    const match = input.match(re)
    if (match) {
      let pseudo = PseudoClasses[match[3]] || `:${match[3]}`
      if (match[2])
        pseudo = `:${match[2]}(${pseudo})`
      return {
        matcher: input.slice(match[1].length + tag.length + 2),
        selector: s => rawRe.test(s)
          ? s.replace(rawRe, `${parent}${pseudo}:`)
          : `${parent}${pseudo}${combinator}${s}`,
      }
    }
  }
}

export const variantPseudoElements: VariantFunction = (input: string) => {
  const match = input.match(PseudoElementsRE)
  if (match) {
    const pseudo = PseudoElements[match[1]] || `::${match[1]}`
    return {
      matcher: input.slice(match[1].length + 1),
      selector: s => `${s}${pseudo}`,
    }
  }
}

export const variantPseudoClasses: VariantObject = {
  match: (input: string) => {
    const match = input.match(PseudoClassesRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || `:${match[1]}`
      return {
        matcher: input.slice(match[1].length + 1),
        selector: s => `${s}${pseudo}`,
      }
    }
  },
  multiPass: true,
}

export const variantPseudoClassFunctions: VariantObject = {
  match: (input: string) => {
    const match = input.match(PseudoClassFunctionsRE)
    if (match) {
      const fn = match[1]
      const pseudo = PseudoClasses[match[2]] || `:${match[2]}`
      return {
        matcher: input.slice(match[1].length + match[2].length + 2),
        selector: s => `${s}:${fn}(${pseudo})`,
      }
    }
  },
  multiPass: true,
}

export const variantTaggedPseudoClasses = (options: PresetMiniOptions = {}): VariantObject[] => {
  const attributify = !!options?.attributifyPseudo

  return [
    {
      match: taggedPseudoClassMatcher('group', attributify ? '[group=""]' : '.group', ' '),
      multiPass: true,
    },
    {
      match: taggedPseudoClassMatcher('peer', attributify ? '[peer=""]' : '.peer', '~'),
      multiPass: true,
    },
    {
      match: taggedPseudoClassMatcher('parent', attributify ? '[parent=""]' : '.parent', '>'),
      multiPass: true,
    },
    {
      match: taggedPseudoClassMatcher('previous', attributify ? '[previous=""]' : '.previous', '+'),
      multiPass: true,
    },
  ]
}

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
