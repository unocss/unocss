import type { VariantContext, VariantHandler, VariantHandlerContext, VariantObject } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'

export const variantMatcher = (name: string, handler: (input: VariantHandlerContext) => Record<string, any>): VariantObject => {
  let re: RegExp
  return {
    name,
    match: (input: string, ctx: VariantContext): VariantHandler | undefined => {
      re = re || new RegExp(`^${escapeRegExp(name)}${ctx.generator.config.separator}`)
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

export const variantParentMatcher = (name: string, parent: string): VariantObject => {
  let re: RegExp
  return {
    name,
    match: (input: string, ctx: VariantContext): VariantHandler | undefined => {
      re = re || new RegExp(`^${escapeRegExp(name)}${ctx.generator.config.separator}`)
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
