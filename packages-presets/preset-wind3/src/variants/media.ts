import type { Variant } from '@unocss/core'
import { variantParentMatcher } from '@unocss/preset-mini/utils'

export const variantContrasts: Variant[] = [
  variantParentMatcher('contrast-more', '@media (prefers-contrast: more)'),
  variantParentMatcher('contrast-less', '@media (prefers-contrast: less)'),
]

export const variantMotions: Variant[] = [
  variantParentMatcher('motion-reduce', '@media (prefers-reduced-motion: reduce)'),
  variantParentMatcher('motion-safe', '@media (prefers-reduced-motion: no-preference)'),
]

export const variantOrientations: Variant[] = [
  variantParentMatcher('landscape', '@media (orientation: landscape)'),
  variantParentMatcher('portrait', '@media (orientation: portrait)'),
]
