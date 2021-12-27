import type { Preset } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { variants } from '@unocss/preset-mini/variants'
import { rules } from './rules'
import { containerShortcuts } from './rules/container'
import { theme } from './theme'
import { variantColorsScheme } from './variants'

export { colors } from '@unocss/preset-mini'

export type { Theme } from '@unocss/preset-mini'

export { theme }

export interface UnoOptions extends PresetMiniOptions { }

export const presetWind = (options: UnoOptions = {}): Preset<Theme> => {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false
  options.variablePrefix = options.variablePrefix ?? 'un-'

  return {
    name: '@unocss/preset-wind',
    theme,
    rules,
    shortcuts: [
      ...containerShortcuts,
    ],
    variants: [
      ...variants,
      ...variantColorsScheme,
    ],
    options,
  }
}

export default presetWind
