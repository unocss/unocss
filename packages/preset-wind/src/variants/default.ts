import type { Variant } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import { variantColorsScheme } from './dark'
import { variantSpaceAndDivide } from './misc'
import { variantPseudoPlaceholder } from './placeholder'

export const variants: Variant<Theme>[] = [
  variantPseudoPlaceholder,
  variantSpaceAndDivide,
  ...miniVariants,
  ...variantColorsScheme,
]
