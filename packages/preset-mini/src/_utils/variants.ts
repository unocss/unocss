import type { VariantHandlerContext, VariantObject } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'
import { getBracket } from '../utils'

export const variantMatcher = (name: string, handler: (input: VariantHandlerContext) => Record<string, any>): VariantObject => {
  const re = new RegExp(`^${escapeRegExp(name)}[:-]`)
  return {
    name,
    match(input) {
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
    match(input) {
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

export const variantGetBracket = (prefix: string, matcher: string, separators: string[]): string[] | undefined => {
  if (matcher.startsWith(`${prefix}[`)) {
    const [match, rest] = getBracket(matcher.slice(prefix.length), '[', ']') ?? []
    if (match && rest) {
      for (const separator of separators) {
        if (rest.startsWith(separator))
          return [match, rest.slice(separator.length), separator]
      }
      return [match, rest, '']
    }
  }
}

export const variantGetParameter = (prefix: string, matcher: string, separators: string[]): string[] | undefined => {
  if (matcher.startsWith(prefix)) {
    const body = variantGetBracket(prefix, matcher, separators)
    if (body)
      return body
    for (const separator of separators) {
      const pos = matcher.indexOf(separator, prefix.length)
      if (pos !== -1)
        return [matcher.slice(prefix.length, pos), matcher.slice(pos + separator.length)]
    }
  }
}
