import type { Variant } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import type { Theme } from '../theme'
import { variantBreakpoints } from './breakpoints'
import { variantCombinators } from './combinators'
import { variantColorsMediaOrClass } from './dark'
import { variantLanguageDirections } from './directions'
import { variantCssLayer, variantInternalLayer, variantScope, variantSelector, variantVariables } from './misc'
import { variantNegative } from './negative'
import { variantImportant } from './important'
import { variantCustomMedia, variantPrint } from './media'
import { partClasses, variantPseudoClassFunctions, variantPseudoClassesAndElements, variantTaggedPseudoClasses } from './pseudo'

export const variants = (options: PresetMiniOptions): Variant<Theme>[] => [
  variantVariables,
  variantCssLayer,

  variantSelector,
  variantInternalLayer,
  variantNegative,
  variantImportant,
  variantPrint,
  variantCustomMedia,
  variantBreakpoints,
  ...variantCombinators,

  variantPseudoClassesAndElements,
  variantPseudoClassFunctions,
  ...variantTaggedPseudoClasses(options),

  partClasses,
  ...variantColorsMediaOrClass(options),
  ...variantLanguageDirections,
  variantScope,
]
