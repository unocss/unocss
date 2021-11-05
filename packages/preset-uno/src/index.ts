import { Preset } from '@unocss/core'
import { rules } from './rules'
import { theme } from './theme'
import { variants } from './variants'
import { devRules } from './dev'

export { theme, colors } from './theme'

export interface PresetUnoOptions {
  /**
   * Enable development only rules
   *
   * @default false
   */
  dev?: boolean
}

export const preset = (options: PresetUnoOptions = {}): Preset => ({
  theme,
  rules: [
    ...rules,
    ...(options.dev ? devRules : []),
  ],
  variants,
})

export default preset
