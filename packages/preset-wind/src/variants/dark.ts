import type { VariantFunction } from '@unocss/core'
import { variantMatcher, variantParentMatcher } from '@unocss/preset-mini/utils'
import type { UnoOptions } from '..'

export const variantColorsMediaOrClass = (options: UnoOptions = {}): VariantFunction[] => {
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

export const variantColorsScheme: VariantFunction[] = [
  variantMatcher('.dark', input => `.dark $$ ${input}`),
  variantMatcher('.light', input => `.light $$ ${input}`),
  variantParentMatcher('@dark', '@media (prefers-color-scheme: dark)'),
  variantParentMatcher('@light', '@media (prefers-color-scheme: light)'),
]
