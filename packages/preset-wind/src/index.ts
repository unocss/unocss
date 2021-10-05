import { extractorSplit, Preset } from '@unocss/core'
import { rules } from './rules'
import { theme } from './theme'
import { variants } from './variants'

export { theme, colors } from './theme'

export const preset = (): Preset => ({
  theme,
  rules,
  variants,
  extractors: [extractorSplit],
})

export default preset
