import type { Variant } from '@unocss/core'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import type { PresetWindOptions, Theme } from '..'
import { variantCombinators } from './combinators'
import { variantColorsScheme } from './dark'
import { variantMotions, variantOrientations } from './media'
import { variantSpaceAndDivide } from './misc'
import { placeholderModifier } from './placeholder'

export const variants = (options: PresetWindOptions): Variant<Theme>[] => [
  placeholderModifier,
  variantSpaceAndDivide,
  ...miniVariants(options),
  ...variantOrientations,
  ...variantMotions,
  ...variantCombinators,
  ...variantColorsScheme,
]
