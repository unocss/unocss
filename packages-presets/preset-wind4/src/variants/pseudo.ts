import type { VariantObject } from '@unocss/core'
import type { PseudoVariantUtilities } from '@unocss/rule-utils'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme'
import {
  createPartClasses,
  createPseudoClassesAndElements,
  createPseudoClassFunctions,
  createTaggedPseudoClasses,

} from '@unocss/rule-utils'
import { getBracket, h, variantGetBracket } from '../utils'

export function variantPseudoClassesAndElements(): VariantObject<Theme>[] {
  const utils: PseudoVariantUtilities = { getBracket, h, variantGetBracket }
  return createPseudoClassesAndElements<Theme>(utils)
}

export function variantPseudoClassFunctions(): VariantObject<Theme> {
  const utils: PseudoVariantUtilities = { getBracket, h, variantGetBracket }
  return createPseudoClassFunctions<Theme>(utils)
}

export function variantTaggedPseudoClasses(options: PresetWind4Options = {}): VariantObject<Theme>[] {
  const utils: PseudoVariantUtilities = { getBracket, h, variantGetBracket }
  return createTaggedPseudoClasses<Theme>(options, utils)
}

export const variantPartClasses: VariantObject<Theme> = createPartClasses<Theme>()
