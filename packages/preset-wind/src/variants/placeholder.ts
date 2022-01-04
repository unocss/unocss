import type { VariantFunction } from '@unocss/core'

export const variantPseudoPlaceholder: VariantFunction = (input: string) => {
  if (input.match(/^placeholder-/)) {
    return {
      matcher: input.replace(/-/, '-$-placeholder-'),
    }
  }
}

