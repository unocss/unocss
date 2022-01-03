import type { Variant } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import { variantColorsScheme } from './dark'
import { variantSpaceAndDivide } from './misc'

export const variants: Variant<Theme>[] = [
  variantSpaceAndDivide,
  ...miniVariants,
  ...variantColorsScheme,
]
