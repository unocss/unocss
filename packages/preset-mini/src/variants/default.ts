import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'
import { variantBreakpoints } from './breakpoints'
import { variantChildren } from './children'
import { variantSpace, variantNegative, variantImportant } from './misc'
import { variantPseudoClasses, variantPseudoElements } from './pseudo'

export const variants: Variant<Theme>[] = [
  variantSpace,
  variantNegative,
  variantImportant,
  variantBreakpoints,
  ...variantChildren,
  variantPseudoClasses,
  variantPseudoElements,
]
