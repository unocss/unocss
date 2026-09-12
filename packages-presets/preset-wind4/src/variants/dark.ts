import type { Variant } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme'
import { variantMatcher, variantParentMatcher, variantPrefix } from '@unocss/rule-utils'

export function variantColorsMediaOrClass(options: PresetWind4Options = {}): Variant<Theme>[] {
  if (options?.dark === 'class' || typeof options.dark === 'object') {
    const { dark = '.dark', light = '.light' } = typeof options.dark === 'string'
      ? {}
      : options.dark

    return [
      variantMatcher('dark', (input, ctx) => ({ prefix: variantPrefix(input, `${dark} $$ `, ctx) })),
      variantMatcher('light', (input, ctx) => ({ prefix: variantPrefix(input, `${light} $$ `, ctx) })),
    ] as Variant<Theme>[]
  }

  return [
    variantParentMatcher('dark', '@media (prefers-color-scheme: dark)'),
    variantParentMatcher('light', '@media (prefers-color-scheme: light)'),
  ] as Variant<Theme>[]
}

export const variantColorsScheme: Variant<Theme>[] = [
  variantMatcher('.dark', (input, ctx) => ({ prefix: variantPrefix(input, '.dark $$ ', ctx) })),
  variantMatcher('.light', (input, ctx) => ({ prefix: variantPrefix(input, '.light $$ ', ctx) })),
  variantParentMatcher('@dark', '@media (prefers-color-scheme: dark)'),
  variantParentMatcher('@light', '@media (prefers-color-scheme: light)'),
  variantParentMatcher('not-dark', '@media not (prefers-color-scheme: dark)'),
]
