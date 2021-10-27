import { toArray, Variant } from '@unocss/core'
import { variantMatcher } from '../utils/variants'

export function createPseudoClassVariant(name: string, pseudo = name): Variant[] {
  return [
    variantMatcher(name, input => `${input}:${pseudo}`),
    variantMatcher(`not-${name}`, input => `${input}:not(:${pseudo})`),
    variantMatcher(`group-${name}`, input => `.group:${pseudo} ${input}`),
  ]
}

export function createPseudoElementVariant(name: string): Variant {
  return variantMatcher(name, input => `${input}::${name}`)
}

export const variantPseudoClasses = [
  'active',
  'checked',
  'default',
  'empty',
  'enabled',
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
]
  .flatMap(i => createPseudoClassVariant(...toArray(i) as [string, string]))

export const variantPseudoElements = [
  'before',
  'after',
  'first-letter',
  'first-line',
  'selection',
].map(createPseudoElementVariant)
