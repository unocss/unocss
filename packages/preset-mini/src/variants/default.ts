import type { Variant } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import type { Theme } from '../theme'
import { variantBreakpoints } from './breakpoints'
import { variantCombinators } from './combinators'
import { variantColorsMediaOrClass } from './dark'
import { variantLanguageDirections } from './directions'
import { variantImportant, variantNegative } from './misc'
import { variantMotions, variantOrientations, variantPrint } from './media'
import { partClasses, variantPseudoClassFunctions, variantPseudoClasses, variantPseudoElements, variantTaggedPseudoClasses } from './pseudo'
import { variantScopes } from './scopes'

export const variants = (options: PresetMiniOptions): Variant<Theme>[] => [
  variantNegative,
  variantImportant,
  variantPrint,
  ...variantOrientations,
  ...variantMotions,
  variantBreakpoints,
  ...variantScopes,
  ...variantCombinators,
  variantPseudoClasses,
  variantPseudoClassFunctions,
  ...variantTaggedPseudoClasses(options),
  variantPseudoElements,
  partClasses,
  ...variantColorsMediaOrClass(options),
  ...variantLanguageDirections,
]
