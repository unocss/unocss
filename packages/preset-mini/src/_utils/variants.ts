import type { VariantHandler, VariantHandlerContext, VariantObject } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'
import type { PresetMiniOptions } from '..'

export const variantMatcher = (name: string, handler: (input: VariantHandlerContext) => Record<string, any>, options: PresetMiniOptions = {}): VariantObject => {
  const re = new RegExp(`^${escapeRegExp(name)}${options.separator}`)
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

export const variantParentMatcher = (name: string, parent: string, options: PresetMiniOptions = {}): VariantObject => {
  const re = new RegExp(`^${escapeRegExp(name)}${options.separator}`)
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
