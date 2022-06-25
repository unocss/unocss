import type { Variant } from '@unocss/core'
import { variantMatcher, variantParentMatcher } from '@unocss/preset-mini/utils'

export const variantColorsScheme: Variant[] = [
  variantMatcher('.dark', input => ({ prefix: `${input.prefix}.dark $$ ` })),
  variantMatcher('.light', input => ({ prefix: `${input.prefix}.light $$ ` })),
  variantParentMatcher('@dark', '@media (prefers-color-scheme: dark)'),
  variantParentMatcher('@light', '@media (prefers-color-scheme: light)'),
]
