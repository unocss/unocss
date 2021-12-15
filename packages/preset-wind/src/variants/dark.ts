import type { Variant } from '@unocss/core'
import { variantMatcher } from '@unocss/preset-mini/utils'

export const variantColorsScheme: Variant[] = [
  variantMatcher('\\.dark', input => `.dark $$ ${input}`),
  variantMatcher('\\.light', input => `.light $$ ${input}`),

  (v) => {
    const dark = variantMatcher('@dark')(v)
    if (dark) {
      return {
        ...dark,
        parent: '@media (prefers-color-scheme: dark)',
      }
    }
    const light = variantMatcher('@light')(v)
    if (light) {
      return {
        ...light,
        parent: '@media (prefers-color-scheme: light)',
      }
    }
  },
]
