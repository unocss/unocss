import type { VariantObject } from '@unocss/core'
import { taggedPseudoClassMatcher } from '@unocss/preset-mini/variants'

export const variantPseudoClasses: VariantObject = {
  match: (input: string) => {
    const g = taggedPseudoClassMatcher('group', '[group=""]', ' ')(input)
    if (g)
      return g

    const p = taggedPseudoClassMatcher('peer', '[peer=""]', '~')(input)
    if (p)
      return p
  },
  multiPass: true,
}
