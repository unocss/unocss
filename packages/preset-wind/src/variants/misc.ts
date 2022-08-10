import type { Variant } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'

export const variantSpaceAndDivide: Variant<Theme> = (matcher) => {
  if (/^space-?([xy])-?(-?.+)$/.test(matcher) || /^divide-/.test(matcher)) {
    return {
      matcher,
      selector: (input) => {
        return `${input}>:not([hidden])~:not([hidden])`
      },
    }
  }
}
