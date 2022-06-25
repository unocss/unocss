import type { Variant } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantLanguageDirections: Variant[] = [
  variantMatcher('rtl', input => ({ prefix: `${input.prefix}[dir="rtl"] $$ ` })),
  variantMatcher('ltr', input => ({ prefix: `${input.prefix}[dir="ltr"] $$ ` })),
]
