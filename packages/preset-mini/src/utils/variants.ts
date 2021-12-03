import { VariantHandler } from '@unocss/core'

export const variantMatcher = (name: string, selector?: (input: string) => string | undefined) => {
  const length = name.length + 1
  const re = new RegExp(`^${name}[:-]`)
  return (input: string): VariantHandler | undefined => {
    return input.match(re)
      ? {
        matcher: input.slice(length),
        selector,
      }
      : undefined
  }
}
