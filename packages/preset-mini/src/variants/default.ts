import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'
import { variantBreakpoints } from './breakpoints'
import { variantCombinators } from './combinators'
import { variantSpace, variantNegative, variantImportant } from './misc'
import { variantPseudoClasses, variantPseudoElements } from './pseudo'

export const variants: Variant<Theme>[] = [
  variantSpace,
  variantNegative,
  variantImportant,
  variantBreakpoints,
  ...variantCombinators,
  variantPseudoClasses,
  variantPseudoElements,
]
