import type { VariantHandler } from '@unocss/core'
import { escapeRegExp } from '@unocss/core'

export const variantMatcher = (name: string, selector?: (input: string) => string | undefined) => {
  const re = new RegExp(`^${escapeRegExp(name)}[:-]`)
  return (input: string): VariantHandler | undefined => {
    const match = input.match(re)
    if (match) {
      return {
        matcher: input.slice(match[0].length),
        selector,
      }
    }
  }
}

export const variantParentMatcher = (name: string, parent: string) => {
  const re = new RegExp(`^${escapeRegExp(name)}[:-]`)
  return (input: string): VariantHandler | undefined => {
    const match = input.match(re)
    if (match) {
      return {
        matcher: input.slice(match[0].length),
        parent,
      }
    }
  }
}
