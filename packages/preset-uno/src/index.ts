import { Preset } from '@unocss/core'
import { rules } from './rules'
import { theme } from './theme'
import { variants } from './variants'
import { whereAmI } from './rules/where-am-i'

export { theme, colors } from './theme'

export const preset = (debug = false): Preset => ({
  theme,
  rules: [...rules, whereAmI(debug)],
  variants,
})

export default preset
