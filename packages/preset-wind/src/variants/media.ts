import type { VariantFunction } from '@unocss/core'
import { variantParentMatcher } from '@unocss/preset-mini/utils'

export const variantMotions: VariantFunction[] = [
  variantParentMatcher('motion-reduce', '@media (prefers-reduced-motion: reduce)'),
  variantParentMatcher('motion-safe', '@media (prefers-reduced-motion: no-preference)'),
]

export const variantOrientations: VariantFunction[] = [
  variantParentMatcher('landscape', '@media (orientation: landscape)'),
  variantParentMatcher('portrait', '@media (orientation: portrait)'),
]
