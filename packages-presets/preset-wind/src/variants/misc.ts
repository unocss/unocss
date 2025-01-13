import type { Variant } from '@unocss/core'
import { variantMatcher } from '@unocss/rule-utils'

export const variantSpaceAndDivide: Variant = (matcher) => {
  // test/svelte-scoped.test.ts:350:55
  if (matcher.startsWith('_'))
    return

  if (/space-[xy]-.+$/.test(matcher) || /divide-/.test(matcher)) {
    return {
      matcher,
      selector: (input) => {
        const not = '>:not([hidden])~:not([hidden])'
        return input.includes(not) ? input : `${input}${not}`
      },
    }
  }
}

export const variantStickyHover: Variant[] = [
  variantMatcher('@hover', input => ({
    parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (hover: hover) and (pointer: fine)`,
    selector: `${input.selector || ''}:hover`,
  })),
]
