import type { Variant } from '@unocss/core'

export const variantSpaceAndDivide: Variant = (matcher) => {
  if (/^space-?([xy])-?(-?.+)$/.test(matcher) || /^divide-/.test(matcher)) {
    return {
      matcher,
      selector: (input) => {
        return `${input}>:not([hidden])~:not([hidden])`
      },
    }
  }
}
