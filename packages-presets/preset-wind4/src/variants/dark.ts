import type { Variant } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme'
import { variantMatcher, variantParentMatcher } from '../utils'

export function variantColorsMediaOrClass(options: PresetWind4Options = {}): Variant<Theme>[] {
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

export const variantColorsScheme: Variant<Theme>[] = [
  variantMatcher('.dark', input => ({ prefix: `.dark $$ ${input.prefix}` })),
  variantMatcher('.light', input => ({ prefix: `.light $$ ${input.prefix}` })),
  variantParentMatcher('@dark', '@media (prefers-color-scheme: dark)'),
  variantParentMatcher('@light', '@media (prefers-color-scheme: light)'),
  variantParentMatcher('not-dark', '@media not (prefers-color-scheme: dark)'),
]
