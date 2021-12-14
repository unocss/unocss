import type { Variant } from '@unocss/core'
import { variantTaggedPseudoClasses } from '.'
import type { PresetMiniOptions } from '..'
import type { Theme } from '../theme'
import { variantBreakpoints } from './breakpoints'
import { variantCombinators } from './combinators'
import { variantColorsClass, variantColorsMedia } from './dark'
import { variantImportant, variantNegative, variantSpace } from './misc'
import { partClasses, variantPseudoClasses, variantPseudoElements } from './pseudo'

export const variants = (options: PresetMiniOptions): Variant<Theme>[] => [
  variantSpace,
  variantNegative,
  variantImportant,
  variantBreakpoints,
  ...variantCombinators,
  variantPseudoClasses,
  variantTaggedPseudoClasses(options),
  variantPseudoElements,
  partClasses,
  ...options.dark === 'media'
    ? variantColorsMedia
    : variantColorsClass,
]
