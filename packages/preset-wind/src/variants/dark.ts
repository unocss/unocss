import { Variant } from '../../../core/src/types'
import { variantMatcher } from '../../../core/src/utils'

export const variantColorsClass: Variant[] = [
  {
    match: variantMatcher('dark'),
    selector: input => `.dark $$ ${input}`,
  },
  {
    match: variantMatcher('light'),
    selector: input => `.light $$ ${input}`,
  },
]

export const variantColorsMedia: Variant[] = [
  {
    match: variantMatcher('dark'),
    mediaQuery: () => '@media (prefers-color-scheme: dark)',
  },
  {
    match: variantMatcher('light'),
    mediaQuery: () => '@media (prefers-color-scheme: light)',
  },
]
