import { Variant } from '../../../types'
import { variantMatcher } from '../../../utils'

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
