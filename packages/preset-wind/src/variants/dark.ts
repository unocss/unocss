import { Variant } from '@unocss/core'
import { variantMatcher } from '../utils'

export const variantColorsClass: Variant[] = [
  variantMatcher('dark', input => `.dark $$ ${input}`),
  variantMatcher('light', input => `.light $$ ${input}`),
]

export const variantColorsMedia: Variant[] = [
  (v) => {
    const dark = variantMatcher('dark')(v)
    if (dark) {
      return {
        ...dark,
        parent: '@media (prefers-color-scheme: dark)',
      }
    }
    const light = variantMatcher('light')(v)
    if (light) {
      return {
        ...light,
        parent: '@media (prefers-color-scheme: light)',
      }
    }
  },
]
