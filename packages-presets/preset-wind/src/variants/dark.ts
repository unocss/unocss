import type { Variant } from '@unocss/core'
import { variantMatcher, variantParentMatcher } from '@unocss/preset-mini/utils'

export const variantColorsScheme: Variant[] = [
  variantMatcher('.dark', input => ({ prefix: `.dark $$ ${input.prefix}` })),
  variantMatcher('.light', input => ({ prefix: `.light $$ ${input.prefix}` })),
  variantParentMatcher('@dark', '@media (prefers-color-scheme: dark)'),
  variantParentMatcher('@light', '@media (prefers-color-scheme: light)'),
]
