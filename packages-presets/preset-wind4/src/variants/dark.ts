import type { Variant } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import type { Theme } from '../theme'
import { variantMatcher, variantParentMatcher } from '../utils'

export function variantColorsMediaOrClass(options: PresetMiniOptions = {}): Variant<Theme>[] {
  if (options?.dark === 'class' || typeof options.dark === 'object') {
    const { dark = '.dark', light = '.light' } = typeof options.dark === 'string'
      ? {}
      : options.dark

    return [
      variantMatcher('dark', input => ({ prefix: `${dark} $$ ${input.prefix}` })),
      variantMatcher('light', input => ({ prefix: `${light} $$ ${input.prefix}` })),
    ] as Variant<Theme>[]
  }

  return [
    variantParentMatcher('dark', '@media (prefers-color-scheme: dark)'),
    variantParentMatcher('light', '@media (prefers-color-scheme: light)'),
  ] as Variant<Theme>[]
}
