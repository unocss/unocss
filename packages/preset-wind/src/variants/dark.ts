import type { Variant } from '@unocss/core'
import { variantMatcher, variantParentMatcher } from '@unocss/preset-mini/utils'

export const variantColorsScheme: Variant[] = [
  variantMatcher('.dark', input => `.dark $$ ${input}`),
  variantMatcher('.light', input => `.light $$ ${input}`),
  variantParentMatcher('@dark', '@media (prefers-color-scheme: dark)'),
  variantParentMatcher('@light', '@media (prefers-color-scheme: light)'),
]
