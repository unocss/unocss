import type { Variant } from '@unocss/core'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import type { Theme, UnoOptions } from '..'
import { variantCombinators } from './combinators'
import { variantColorsScheme } from './dark'
import { variantSpaceAndDivide } from './misc'
import { placeholderModifier } from './placeholder'

export const variants = (options: UnoOptions): Variant<Theme>[] => [
  placeholderModifier,
  variantSpaceAndDivide,
  ...miniVariants(options),
  ...variantCombinators,
  ...variantColorsScheme,
]
