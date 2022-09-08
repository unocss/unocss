import type { Variant } from '@unocss/core'
import { variantMatcher } from '@unocss/preset-mini/utils'

export const variantCombinators: Variant[] = [
  // TODO pass the options here
  variantMatcher('svg', input => ({ selector: `${input.selector} svg` })),
]
