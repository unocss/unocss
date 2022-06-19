import type { Variant } from '@unocss/core'

export const variantSpaceAndDivide: Variant = (matcher) => {
  if (/^space-?([xy])-?(-?.+)$/.test(matcher) || /^divide-/.test(matcher)) {
    return {
      matcher,
      handler: (input, next) => next({
        ...input,
        selector: `${input.selector}>:not([hidden])~:not([hidden])`,
      }),
    }
  }
}
