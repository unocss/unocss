import type { Variant } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantLanguageDirections: Variant[] = [
  variantMatcher('rtl', input => `[dir="rtl"] $$ ${input}`),
  variantMatcher('ltr', input => `[dir="ltr"] $$ ${input}`),
]
