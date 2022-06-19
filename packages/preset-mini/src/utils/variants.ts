import type { VariantHandler, VariantObject } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'

export const variantMatcher = (name: string, selector?: (input: string) => string): VariantObject => {
  const re = new RegExp(`^${escapeRegExp(name)}[:-]`)
  return {
    name,
    match: (input: string): VariantHandler | undefined => {
      const match = input.match(re)
      if (match) {
        return {
          matcher: input.slice(match[0].length),
          handler: (input, next) => next({
            ...input,
            selector: selector ? selector(input.selector) : input.selector,
          }),
        }
      }
    },
    autocomplete: `${name}:`,
  }
}

export const variantParentMatcher = (name: string, parent: string): VariantObject => {
  const re = new RegExp(`^${escapeRegExp(name)}[:-]`)
  return {
    name,
    match: (input: string): VariantHandler | undefined => {
      const match = input.match(re)
      if (match) {
        return {
          matcher: input.slice(match[0].length),
          handler: (input, next) => next({
            ...input,
            parent,
          }),
        }
      }
    },
    autocomplete: `${name}:`,
  }
}
