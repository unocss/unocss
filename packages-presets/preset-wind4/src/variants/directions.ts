import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'
import { variantMatcher, variantPrefix } from '@unocss/rule-utils'

export const variantLanguageDirections = [
  variantMatcher('rtl', (input, ctx) => ({ prefix: variantPrefix(input, '[dir="rtl"] $$ ', ctx) })),
  variantMatcher('ltr', (input, ctx) => ({ prefix: variantPrefix(input, '[dir="ltr"] $$ ', ctx) })),
] as Variant<Theme>[]
