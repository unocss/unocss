import type { Variant } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import type { Theme } from '../theme'
import { variantBreakpoints } from './breakpoints'
import { variantCombinators } from './combinators'
import { variantColorsMediaOrClass } from './dark'
import { variantLanguageDirections } from './directions'
import { variantCssLayer, variantInternalLayer, variantScope, variantSelector, variantTheme, variantVariables } from './misc'
import { variantNegative } from './negative'
import { variantImportant } from './important'
import { variantCustomMedia, variantPrint } from './media'
import { variantSupports } from './supports'
import { variantPartClasses, variantPseudoClassFunctions, variantPseudoClassesAndElements, variantTaggedPseudoClasses } from './pseudo'
import { variantAria, variantTaggedAriaAttributes } from './aria'
import { variantDataAttribute, variantTaggedDataAttributes } from './data'
import { variantContainerQuery } from './container'
import { variantChildren } from './children'

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

    variantPartClasses,
    ...variantColorsMediaOrClass(options),
    ...variantLanguageDirections,
    variantScope,
    ...variantChildren,

    variantContainerQuery,
    variantVariables,
    ...variantTaggedDataAttributes,
    ...variantTaggedAriaAttributes,

    variantTheme,
  ]
}
