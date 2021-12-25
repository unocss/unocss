import type { Variant } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantColorsMediaOrClass: Variant[] = [
  (v, { options: { dark } }) => {
    if (dark === 'class') {
      const match = variantMatcher('dark', input => `.dark $$ ${input}`)(v)
      if (match)
        return match
    }
  },
  (v, { options: { dark } }) => {
    if (dark === 'class') {
      const match = variantMatcher('light', input => `.light $$ ${input}`)(v)
      if (match)
        return match
    }
  },
  (v, { options: { dark } }) => {
    if (dark === 'media') {
      const match = variantMatcher('dark')(v)
      if (match) {
        return {
          ...match,
          parent: '@media (prefers-color-scheme: dark)',
        }
      }
    }
  },
  (v, { options: { dark } }) => {
    if (dark === 'media') {
      const match = variantMatcher('light')(v)
      if (match) {
        return {
          ...match,
          parent: '@media (prefers-color-scheme: light)',
        }
      }
    }
  },
]
