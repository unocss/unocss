import { Variant } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantChildren: Variant[] = [
  variantMatcher('children', input => `${input} > *`),
  variantMatcher('all', input => `${input} *`),
  variantMatcher('next', input => `${input}+*`),
]
