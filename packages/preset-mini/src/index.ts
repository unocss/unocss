import type { Preset, PresetOptions } from '@unocss/core'
import { rules } from './rules'
import type { Theme, ThemeAnimation } from './theme'
import { theme } from './theme'
import { variants } from './variants'

export { theme, colors } from './theme'

export type { ThemeAnimation, Theme }

export interface PresetMiniOptions extends PresetOptions {
  /**
   * @default 'class'
   */
  dark?: 'class' | 'media'
  /**
   * @default false
   */
  attributifyPseudo?: Boolean
}

export const presetMini = (options: PresetMiniOptions = {}): Preset<Theme> => {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false

  return {
    name: '@unocss/preset-mini',
    theme,
    rules,
    variants,
    options,
  }
}

export default presetMini
