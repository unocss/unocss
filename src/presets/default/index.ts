import { Preset } from '../..'
import { extractorSplit } from './extractors'
import { defaultRules } from './rules'
import { defaultVariants } from './variants'

export * from './rules'
export * from './variants'
export * from './theme'
export * from './extractors'

export const presetDefault = (): Preset => ({
  rules: defaultRules,
  variants: defaultVariants,
  extractors: [extractorSplit],
})
