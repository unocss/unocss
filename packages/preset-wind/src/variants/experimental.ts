import type { Variant } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import { variantMatcher } from '@unocss/preset-mini/utils'

export const variantStickyHover: Variant[] = [
  variantMatcher('@hover', (input) => {
    warnOnce('The @hover variant is experimental and may not follow semver.')
    return {
      parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (hover: hover) and (pointer: fine)`,
      selector: `${input.selector || ''}:hover`,
    }
  }),
]
