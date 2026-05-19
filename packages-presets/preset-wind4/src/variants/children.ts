import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'
import { variantMatcher } from '../utils'

export const variantChildren: Variant<Theme>[] = [
  variantMatcher('*', input => ({ selector: `${input.selector} > *` }), { order: -1 }),
  variantMatcher('**', input => ({ selector: `${input.selector} *` }), { order: -1 }),
]
