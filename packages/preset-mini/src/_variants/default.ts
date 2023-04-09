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
import { variantSupports } from './supports'
import { partClasses, variantPseudoClassFunctions, variantPseudoClassesAndElements, variantTaggedPseudoClasses } from './pseudo'
import { variantAria } from './aria'
import { variantDataAttribute } from './data'
import { variantContainerQuery } from './container'

export function variants(options: PresetMiniOptions): Variant<Theme>[] {
  return [
    variantAria,
    variantDataAttribute,
    variantCssLayer,

    variantSelector,
    variantInternalLayer,
    variantNegative,
    variantImportant(),
    variantSupports,
    variantPrint,
    variantCustomMedia,
    variantBreakpoints(),
    ...variantCombinators,

    variantPseudoClassesAndElements(),
    variantPseudoClassFunctions(),
    ...variantTaggedPseudoClasses(options),

    partClasses,
    ...variantColorsMediaOrClass(options),
    ...variantLanguageDirections,
    variantScope,

    variantContainerQuery,
    variantVariables,
  ]
}
