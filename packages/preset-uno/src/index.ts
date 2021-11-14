import { Preset } from '@unocss/core'
import { rules } from './rules'
import { Theme, theme } from './theme'
import { variants } from './variants'

export { theme, colors } from './theme'

export const preset = (): Preset<Theme> => ({
  name: '@unocss/preset-uno',
  theme,
  rules,
  variants,
})

export default preset
