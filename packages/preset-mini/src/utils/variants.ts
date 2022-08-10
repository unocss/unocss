import type { VariantHandler, VariantHandlerContext, VariantObject } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'

export const variantMatcher = <T>(name: string, handler: (input: VariantHandlerContext) => Record<string, any>): VariantObject<T> => {
  const re = new RegExp(`^${escapeRegExp(name)}[:-]`)
  return {
    name,
    match: (input: string): VariantHandler | undefined => {
      const match = input.match(re)
      if (match) {
        return {
          matcher: input.slice(match[0].length),
          handle: (input, next) => next({
            ...input,
            ...handler(input),
          }),
        }
      }
    },
    autocomplete: `${name}:`,
  }
}

export const variantParentMatcher = <T>(name: string, parent: string): VariantObject<T> => {
  const re = new RegExp(`^${escapeRegExp(name)}[:-]`)
  return {
    name,
    match: (input: string): VariantHandler | undefined => {
      const match = input.match(re)
      if (match) {
        return {
          matcher: input.slice(match[0].length),
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${parent}`,
          }),
        }
      }
    },
    autocomplete: `${name}:`,
  }
}
