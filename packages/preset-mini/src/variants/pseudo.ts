import type { CSSEntries, VariantFunction, VariantObject } from '@unocss/core'
import { toArray } from '@unocss/core'

export const CONTROL_BYPASS_PSEUDO = '$$no-pseudo'

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
const PseudoClassesPeerRE = new RegExp(`^peer-(${PseudoClassesStr})[:-]`)

export const variantPseudoElements: VariantFunction = (input: string) => {
  const match = input.match(PseudoElementsRE)
  if (match) {
    return {
      matcher: input.slice(match[1].length + 1),
      selector: (s, body) => shouldAdd(body) && `${s}::${match[1]}`,
    }
  }
}

function shouldAdd(entires: CSSEntries) {
  return !entires.find(i => i[0] === CONTROL_BYPASS_PSEUDO) || undefined
}

export const variantPseudoClasses: VariantObject = {
  match: (input: string) => {
    let match = input.match(PseudoClassesRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 1),
        selector: (s, body) => shouldAdd(body) && `${s}:${pseudo}`,
      }
    }

    match = input.match(PseudoClassesNotRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 5),
        selector: (s, body) => shouldAdd(body) && `${s}:not(:${pseudo})`,
      }
    }

    match = input.match(PseudoClassesGroupRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 7),
        selector: (s, body) => shouldAdd(body) && s.includes('.group:')
          ? s.replace(/\.group:/, `.group:${pseudo}:`)
          : `.group:${pseudo} ${s}`,
      }
    }

    match = input.match(PseudoClassesPeerRE)
    if (match) {
      const pseudo = PseudoClasses[match[1]] || match[1]
      return {
        matcher: input.slice(match[1].length + 6),
        selector: (s, body) => shouldAdd(body) && s.includes('.peer:')
          ? s.replace(/\.peer:/, `.peer:${pseudo}:`)
          : `.peer:${pseudo} ~ ${s}`,
      }
    }
  },
  multiPass: true,
}
