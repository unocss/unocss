import type { Variant } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import { variantColorsScheme } from './dark'

export const variants: Variant<Theme>[] = [
  ...miniVariants,
  ...variantColorsScheme,
]
