import { Preset } from '@unocss/core'
import { rules } from './rules'
import { theme } from './theme'
import { variants } from './variants'

export { theme, colors } from './theme'

export const preset = (): Preset => ({
  name: '@unocss/preset-uno',
  theme,
  rules,
  variants,
})

export default preset
