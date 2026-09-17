import type { VariantObject } from '@unocss/core'
import { variantBreakpoints as sharedVariantBreakpoints } from '@unocss/rule-utils'

export function variantBreakpoints(): VariantObject {
  return sharedVariantBreakpoints('breakpoints')
}
