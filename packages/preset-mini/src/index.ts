import type { Preset } from '@unocss/core'
import { rules } from './rules'
import type { Theme, ThemeAnimation } from './theme'
import { theme } from './theme'
import { variants } from './variants'

export { theme, colors } from './theme'

export type { ThemeAnimation, Theme }

export interface PresetMiniOptions {
  /**
   * @default 'class'
   */
  dark?: 'class' | 'media'
  /**
   * @default false
   */
  attributifyPseudo?: Boolean
}

export const presetMini = (options: PresetMiniOptions = {}): Preset<Theme> => ({
  name: '@unocss/preset-mini',
  theme,
  rules,
  variants: variants(options),
  options,
})

export default presetMini
