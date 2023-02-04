import type { Variant } from '@unocss/core'

export const variantSpaceAndDivide: Variant = (matcher) => {
  // test/svelte-scoped.test.ts:350:55
  if (matcher.startsWith('_'))
    return

  if (/space-?([xy])-?(-?.+)$/.test(matcher) || /divide-/.test(matcher)) {
    return {
      matcher,
      selector: (input) => {
        return `${input}>:not([hidden])~:not([hidden])`
      },
    }
  }
}
