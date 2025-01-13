import type { Variant } from '@unocss/core'
import { variantMatcher } from '@unocss/preset-mini/utils'

export const variantCombinators: Variant[] = [
  variantMatcher('svg', input => ({ selector: `${input.selector} svg` })),
]
