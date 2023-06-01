import type { Variant } from '@unocss/core'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import type { PresetWindOptions, Theme } from '..'
import { variantCombinators } from './combinators'
import { variantColorsScheme } from './dark'
import { variantStickyHover } from './experimental'
import { variantContrasts, variantMotions, variantOrientations } from './media'
import { variantSpaceAndDivide } from './misc'
import { placeholderModifier } from './placeholder'
import { variantHasPseudo } from './has'

export function variants(options: PresetWindOptions): Variant<Theme>[] {
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
    ...variantHasPseudo,
  ]
}
