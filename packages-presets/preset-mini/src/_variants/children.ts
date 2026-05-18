import type { Variant } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantChildren: Variant[] = [
  variantMatcher('*', input => ({ selector: `${input.selector} > *` }), { order: -1 }),
]
