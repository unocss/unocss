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

export const variantGetParameter = (name: string, matcher: string, separators: string[]): string[] | undefined => {
  if (matcher.startsWith(`${name}-`)) {
    const body = variantGetBracket(name, matcher, separators)
    if (body)
      return body
    for (const separator of separators) {
      const pos = matcher.indexOf(separator, name.length + 1)
      if (pos !== -1)
        return [matcher.slice(name.length + 1, pos), matcher.slice(pos + separator.length)]
    }
  }
}
