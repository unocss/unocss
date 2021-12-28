import type { VariantFunction } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantPrint: VariantFunction = (v) => {
  const print = variantMatcher('print')(v)
  if (print) {
    return {
      ...print,
      parent: '@media print',
    }
  }
}
