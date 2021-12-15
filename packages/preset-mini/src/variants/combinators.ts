import type { Variant } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantCombinators: Variant[] = [
  variantMatcher('all', input => `${input} *`),
  variantMatcher('children', input => `${input} > *`),
  variantMatcher('next', input => `${input} + *`),
  variantMatcher('sibling', input => `${input} + *`),
  variantMatcher('siblings', input => `${input} ~ *`),
  variantMatcher('svg', input => `${input} svg *`),
]
