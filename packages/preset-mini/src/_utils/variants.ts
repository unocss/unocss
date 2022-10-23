import type { VariantHandler, VariantHandlerContext, VariantObject } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'
import { getBracket, getComponent } from '../utils'

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

export const variantGetBracket = (name: string, matcher: string, separators: string[]): string[] | undefined => {
  if (matcher.startsWith(`${name}-[`)) {
    const [match, rest] = getBracket(matcher.slice(name.length + 1), '[', ']') ?? []
    if (match && rest) {
      for (const separator of separators) {
        if (rest.startsWith(separator))
          return [match, rest.slice(separator.length), separator]
      }
      return [match, rest, '']
    }
  }
}
