import type { VariantHandler } from '@unocss/core'

export const variantMatcher = (name: string, selector?: (input: string) => string | undefined) => {
  const re = new RegExp(`^(${name})[:-]`)
  return (input: string): VariantHandler | undefined => {
    const match = input.match(re)
    if (match) {
      return {
        matcher: input.slice(match[1].length + 1),
        selector,
      }
    }
  }
}
