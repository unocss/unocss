import type { Variant } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantLanguageDirections: Variant[] = [
  variantMatcher('rtl', input => ({ prefix: `[dir="rtl"] $$ ${input.prefix}` })),
  variantMatcher('ltr', input => ({ prefix: `[dir="ltr"] $$ ${input.prefix}` })),
]
