import { Variant } from '../../../core/src/types'
import { variantMatcher } from '../../../core/src/utils'

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
