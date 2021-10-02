import { MiniwindVariant } from '../../../types'
import { variantMatcher } from '../../../utils'

export const variantColorsClass: MiniwindVariant[] = [
  {
    match: variantMatcher('dark'),
    selector: input => `.dark $$ ${input}`,
  },
  {
    match: variantMatcher('light'),
    selector: input => `.light $$ ${input}`,
  },
]

export const variantColorsMedia: MiniwindVariant[] = [
  {
    match: variantMatcher('dark'),
    mediaQuery: () => '@media (prefers-color-scheme: dark)',
  },
  {
    match: variantMatcher('light'),
    mediaQuery: () => '@media (prefers-color-scheme: light)',
  },
]
