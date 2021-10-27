import { Variant, variantMatcher } from '@unocss/core'

export const variantChildren: Variant[] = [
  {
    match: variantMatcher('children'),
    selector: input => `${input} > *`,
  },
  {
    match: variantMatcher('all'),
    selector: input => `${input} *`,
  },
]
