import type { Variant } from '@unocss/core'
import { variantParentMatcher } from '../utils'

export const variantOrientations: Variant[] = [
  variantParentMatcher('landscape', '@media (orientation: landscape)'),
  variantParentMatcher('portrait', '@media (orientation: portrait)'),
]
