import type { Variant } from '@unocss/core'
import { variantMatcher } from '@unocss/preset-mini/utils'

export const variantStickyHover: Variant[] = [
  variantMatcher('@hover', input => ({
    parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (hover: hover) and (pointer: fine)`,
    selector: `${input.selector || ''}:hover`,
  })),
]
