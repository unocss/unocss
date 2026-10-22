import type { VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { variantBreakpoints as sharedVariantBreakpoints } from '@unocss/rule-utils'

export function variantBreakpoints(): VariantObject<Theme> {
  return sharedVariantBreakpoints('breakpoint') as VariantObject<Theme>
}
