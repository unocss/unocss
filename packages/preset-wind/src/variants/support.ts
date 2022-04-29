import type { Variant } from '@unocss/core'
import { variantParentMatcher } from '@unocss/preset-mini/utils'

export const variantSupport: Variant[] = [
  variantParentMatcher('@support', `@supports (${variantParentMatcher('@support', '').match.matcher})`),
]

export const variantNotSupport: Variant[] = [
  variantParentMatcher('@not-support', `@supports not (${variantParentMatcher('@not-support', '').match.matcher})`),
]
