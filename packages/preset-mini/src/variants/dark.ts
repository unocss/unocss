import type { Variant } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import { variantMatcher, variantParentMatcher } from '../utils'

export const variantColorsMediaOrClass = (options: PresetMiniOptions = {}): Variant[] => {
  if (options?.dark === 'class') {
    return [
      variantMatcher('dark', input => `.dark $$ ${input}`),
      variantMatcher('light', input => `.light $$ ${input}`),
    ]
  }

  return [
    variantParentMatcher('dark', '@media (prefers-color-scheme: dark)'),
    variantParentMatcher('light', '@media (prefers-color-scheme: light)'),
  ]
}
