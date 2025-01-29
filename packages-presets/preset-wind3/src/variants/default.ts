import type { Variant } from '@unocss/core'
import type { PresetWind3Options, Theme } from '..'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import { variantCombinators } from './combinators'
import { variantColorsScheme } from './dark'
import { variantContrasts, variantMotions, variantOrientations } from './media'
import { variantSpaceAndDivide, variantStickyHover } from './misc'
import { variantColorMix } from './mix'
import { placeholderModifier } from './placeholder'

export function variants(options: PresetWind3Options): Variant<Theme>[] {
  return [
    placeholderModifier,
    variantSpaceAndDivide,
    ...miniVariants(options),
    ...variantContrasts,
    ...variantOrientations,
    ...variantMotions,
    ...variantCombinators,
    ...variantColorsScheme,
    ...variantStickyHover,
    variantColorMix<Theme>(),
  ]
}
