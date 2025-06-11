import type { VariantObject } from '@unocss/core'
import type { PseudoVariantUtilities } from '@unocss/rule-utils'
import type { PresetMiniOptions } from '..'
import {
  createPartClasses,
  createPseudoClassesAndElements,
  createPseudoClassFunctions,
  createTaggedPseudoClasses,

} from '@unocss/rule-utils'
import { getBracket, h, variantGetBracket } from '../_utils'

export function variantPseudoClassesAndElements(): VariantObject[] {
  const utils: PseudoVariantUtilities = { getBracket, h, variantGetBracket }
  return createPseudoClassesAndElements(utils)
}

export function variantPseudoClassFunctions(): VariantObject {
  const utils: PseudoVariantUtilities = { getBracket, h, variantGetBracket }
  return createPseudoClassFunctions(utils)
}

export function variantTaggedPseudoClasses(options: PresetMiniOptions = {}): VariantObject[] {
  const utils: PseudoVariantUtilities = { getBracket, h, variantGetBracket }
  return createTaggedPseudoClasses(options, utils)
}

export const variantPartClasses: VariantObject = createPartClasses()
