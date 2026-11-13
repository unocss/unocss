import type { Variant } from '@unocss/core'
import { variantMatcher, variantPrefix } from '../utils'

export const variantLanguageDirections: Variant[] = [
  variantMatcher('rtl', (input, ctx) => ({ prefix: variantPrefix(input, '[dir="rtl"] $$ ', ctx) })),
  variantMatcher('ltr', (input, ctx) => ({ prefix: variantPrefix(input, '[dir="ltr"] $$ ', ctx) })),
]
