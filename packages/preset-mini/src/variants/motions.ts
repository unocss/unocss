import type { Variant } from '@unocss/core'
import { variantParentMatcher } from '../utils'

export const variantMotions: Variant[] = [
  variantParentMatcher('motion-reduce', '@media (prefers-reduced-motion: reduce)'),
  variantParentMatcher('motion-safe', '@media (prefers-reduced-motion: no-preference)'),
]
