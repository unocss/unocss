import { toArray } from '../../../utils'
import { MiniwindVariant } from '../../../types'

export function createPseudoClassVariant(name: string, pseudo = name): MiniwindVariant[] {
  const start = `${name}:`
  const length = start.length

  const notStart = `not-${name}:`
  const notLength = notStart.length

  return [
    {
      match: input => input.startsWith(start) ? input.slice(length) : undefined,
      selector: input => `${input}:${pseudo}`,
    },
    {
      match: input => input.startsWith(notStart) ? input.slice(notLength) : undefined,
      selector: input => `${input}:not(:${pseudo})`,
    },
  ]
}

export function createPseudoElementVariant(name: string): MiniwindVariant {
  const start = `${name}:`
  const length = start.length

  return {
    match: input => input.startsWith(start) ? input.slice(length) : undefined,
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
  'first',
  'focus-visible',
  'focus-within',
  'focus',
  'hover',
  'indeterminate',
  'invalid',
  'last-of-type',
  'last',
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
