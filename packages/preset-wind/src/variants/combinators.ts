import type { Variant } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { variantMatcher } from '@unocss/preset-mini/utils'

export const variantCombinators: Variant<Theme>[] = [
  variantMatcher('svg', input => ({ selector: `${input.selector} svg` })),
]
