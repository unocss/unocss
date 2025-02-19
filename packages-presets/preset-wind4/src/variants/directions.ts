import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'
import { variantMatcher } from '../utils'

export const variantLanguageDirections = [
  variantMatcher('rtl', input => ({ prefix: `[dir="rtl"] $$ ${input.prefix}` })),
  variantMatcher('ltr', input => ({ prefix: `[dir="ltr"] $$ ${input.prefix}` })),
] as Variant<Theme>[]
