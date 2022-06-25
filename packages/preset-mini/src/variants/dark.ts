import type { Variant } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import { variantMatcher, variantParentMatcher } from '../utils'

export const variantColorsMediaOrClass = (options: PresetMiniOptions = {}): Variant[] => {
  if (options?.dark === 'class') {
    return [
      variantMatcher('dark', input => ({ prefix: `${input.prefix}.dark $$ ` })),
      variantMatcher('light', input => ({ prefix: `${input.prefix}.light $$ ` })),
    ]
  }

  return [
    variantParentMatcher('dark', '@media (prefers-color-scheme: dark)'),
    variantParentMatcher('light', '@media (prefers-color-scheme: light)'),
  ]
}
