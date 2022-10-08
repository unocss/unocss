import type { VariantHandler, VariantHandlerContext, VariantObject } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'
import { getComponent } from '../utils'

export const variantMatcher = (name: string, handler: (input: VariantHandlerContext) => Record<string, any>): VariantObject => {
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

export const variantParentMatcher = (name: string, parent: string): VariantObject => {
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

export const variantGetComponent = (name: string, matcher: string): string[] | undefined => {
  if (matcher.startsWith(`${name}-`)) {
    const body = matcher.substring(name.length + 1)

    const [match, rest] = getComponent(body, '[', ']', [':', '-']) ?? []
    if (match && rest && rest !== '')
      return [match, rest]
  }
}

