import { toArray, variantMatcher, Variant } from '@unocss/core'

export function createPseudoClassVariant(name: string, pseudo = name): Variant[] {
  return [
    {
      match: variantMatcher(name),
      selector: input => `${input}:${pseudo}`,
    },
    {
      match: variantMatcher(`not-${name}`),
      selector: input => `${input}:not(:${pseudo})`,
    },
    {
      match: variantMatcher(`group-${name}`),
      selector: input => `.group:${pseudo} ${input}`,
    },
  ]
}

export function createPseudoElementVariant(name: string): Variant {
  return {
    match: variantMatcher(name),
    selector: input => `${input}::${name}`,
  }
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
