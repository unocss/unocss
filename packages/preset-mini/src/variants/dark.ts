import type { Variant } from '@unocss/core'
import { variantMatcher, variantParentMatcher } from '../utils'

export const variantColorsMediaOrClass: Variant[] = [
  (v, { options: { dark } }) => {
    if (dark === 'class')
      return variantMatcher('dark', input => `.dark $$ ${input}`)(v)
  },
  (v, { options: { dark } }) => {
    if (dark === 'class')
      return variantMatcher('light', input => `.light $$ ${input}`)(v)
  },
  (v, { options: { dark } }) => {
    if (dark === 'media')
      return variantParentMatcher('dark', '@media (prefers-color-scheme: dark)')(v)
  },
  (v, { options: { dark } }) => {
    if (dark === 'media')
      return variantParentMatcher('light', '@media (prefers-color-scheme: light)')(v)
  },
]
