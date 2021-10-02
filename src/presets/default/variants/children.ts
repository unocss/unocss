import { MiniwindVariant } from '../../../types'
import { variantMatcher } from '../../../utils'

export const variantChildren: MiniwindVariant = {
  match: variantMatcher('children'),
  selector: input => `${input} > *`,
}
