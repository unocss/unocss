import { NanowindVariant } from '../../../types'

export const variantChildren: NanowindVariant = {
  match: input => input.startsWith('all:') ? input.slice(4) : undefined,
  selector: input => `${input} > *`,
}
