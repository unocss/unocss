import type { Variant } from '@unocss/core'
import { variantMatcher } from '@unocss/preset-mini/utils'

export const variantColorsScheme: Variant[] = [
  variantMatcher('\\.dark', input => `.dark $$ ${input}`),
  variantMatcher('\\.light', input => `.light $$ ${input}`),

  (v) => {
    const match = variantMatcher('@dark')(v)
    if (match) {
      return {
        ...match,
        parent: '@media (prefers-color-scheme: dark)',
      }
    }
  },
  (v) => {
    const match = variantMatcher('@light')(v)
    if (match) {
      return {
        ...match,
        parent: '@media (prefers-color-scheme: light)',
      }
    }
  },
]
