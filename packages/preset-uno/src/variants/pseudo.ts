import { toArray, VariantFunction, VariantObject } from '@unocss/core'

export const PseudoClasses: Record<string, string | undefined> = Object.fromEntries([
  'active',
  'checked',
  'default',
  'empty',
  'enabled',
  'disabled',
  'first-of-type',
  ['first', 'first-child'],
  'focus-visible',
  'focus-within',
  'focus',
  'hover',
  'indeterminate',
  'invalid',
  'last-of-type',
  ['last', 'last-child'],
  'link',
  'only-child',
  'only-of-type',
  'optional',
  'placeholder-shown',
  'read-only',
  'read-write',
  'required',
  'root',
  'target',
  'valid',
  'visited',
  ['even-of-type', 'nth-of-type(even)'],
  ['even', 'nth-child(even)'],
  ['odd-of-type', 'nth-of-type(odd)'],
  ['odd', 'nth-child(odd)'],
].map(toArray))

const PseudoElements = [
  'before',
  'after',
  'first-letter',
  'first-line',
  'selection',
]

const PseudoElementsRE = new RegExp(`^(${PseudoElements.join('|')})[:-]`)

const PseudoClassesStr = Object.keys(PseudoClasses).join('|')
const PseudoClassesRE = new RegExp(`^(${PseudoClassesStr})[:-]`)
const PseudoClassesNotRE = new RegExp(`^not-(${PseudoClassesStr})[:-]`)
const PseudoClassesGroupRE = new RegExp(`^group-(${PseudoClassesStr})[:-]`)

export const variantPseudoElements: VariantFunction = (input: string) => {
  const match = input.match(PseudoElementsRE)
  if (match) {
    return {
      matcher: input.slice(match[1].length + 1),
      selector: input => `${input}::${match[1]}`,
    }
  }
}

export const variantPseudoClasses: VariantObject = {
  match: (input: string) => {
    let match = input.match(PseudoClassesRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 1),
        selector: input => `${input}:${pseudo}`,
      }
    }

    match = input.match(PseudoClassesNotRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 5),
        selector: input => `${input}:not(:${pseudo})`,
      }
    }

    match = input.match(PseudoClassesGroupRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 7),
        selector: s => s.includes('.group:')
          ? s.replace(/\.group:/, `.group:${pseudo}:`)
          : `.group:${pseudo} ${s}`,
      }
    }
  },
  multiPass: true,
}
