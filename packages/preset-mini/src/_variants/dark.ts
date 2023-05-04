import type { Variant } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import { variantMatcher, variantParentMatcher } from '../utils'

export function variantColorsMediaOrClass(options: PresetMiniOptions = {}): Variant[] {
  if (options?.dark === 'class' || typeof options.dark === 'object') {
    const { dark = '.dark', light = '.light' } = typeof options.dark === 'string'
      ? {}
      : options.dark

    return [
      variantMatcher('dark', input => ({ prefix: `${dark} $$ ${input.prefix}` })),
      variantMatcher('light', input => ({ prefix: `${light} $$ ${input.prefix}` })),
    ]
  }

  return [
    variantParentMatcher('dark', '@media (prefers-color-scheme: dark)'),
    variantParentMatcher('light', '@media (prefers-color-scheme: light)'),
  ]
}
