import type { Variant } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import { variantColorsScheme } from './dark'
import { variantFilePseudoElement } from './pseudo'

export const variants: Variant<Theme>[] = [
  ...miniVariants,
  variantFilePseudoElement,
  ...variantColorsScheme,
]
