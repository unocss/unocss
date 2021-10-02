import { NanowindPreset } from '../..'
import { extractorSplit } from './extractors'
import { defaultRules } from './rules'
import { defaultVariants } from './variants'

export * from './rules'
export * from './variants'
export * from './theme'

export const presetDefault: NanowindPreset = {
  rules: defaultRules,
  variants: defaultVariants,
  extractors: [extractorSplit],
}
