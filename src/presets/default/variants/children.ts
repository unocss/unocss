import { MiniwindVariant } from '../../../types'

export const variantChildren: MiniwindVariant = {
  match: input => input.startsWith('all:') ? input.slice(4) : undefined,
  selector: input => `${input} > *`,
}
