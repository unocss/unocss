import { extractorSplit, Preset } from '@unocss/core'
import { rules } from './rules'
import { variants } from './variants'

export const preset = (): Preset => ({
  rules,
  variants,
  extractors: [extractorSplit],
})

export default preset
