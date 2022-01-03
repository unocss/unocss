import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'
import { variantBreakpoints } from './breakpoints'
import { variantCombinators } from './combinators'
import { variantColorsMediaOrClass } from './dark'
import { variantLanguageDirections } from './directions'
import { variantImportant, variantNegative } from './misc'
import { variantMotions } from './motions'
import { variantOrientations } from './orientations'
import { variantPrint } from './prints'
import { partClasses, variantPseudoClassFunctions, variantPseudoClasses, variantPseudoElements, variantTaggedPseudoClasses } from './pseudo'

export const variants: Variant<Theme>[] = [
  variantNegative,
  variantImportant,
  variantPrint,
  ...variantOrientations,
  ...variantMotions,
  variantBreakpoints,
  ...variantCombinators,
  variantPseudoClasses,
  variantPseudoClassFunctions,
  variantTaggedPseudoClasses,
  variantPseudoElements,
  partClasses,
  ...variantColorsMediaOrClass,
  ...variantLanguageDirections,
]
