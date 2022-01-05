import type { Preset } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { variants as miniVariants } from '@unocss/preset-mini/variants'
import { rules } from './rules'
import { containerShortcuts } from './rules/container'
import { theme } from './theme'
import { placeholderModifier, variantColorsScheme, variantSpaceAndDivide } from './variants'

export { colors } from '@unocss/preset-mini'

export type { Theme } from '@unocss/preset-mini'

export { theme }

export interface UnoOptions extends PresetMiniOptions { }

export const presetWind = (options: UnoOptions = {}): Preset<Theme> => {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false

  return {
    name: '@unocss/preset-wind',
    theme,
    rules,
    shortcuts: [
      ...containerShortcuts,
    ],
    variants: [
      placeholderModifier,
      variantSpaceAndDivide,
      ...miniVariants(options),
      ...variantColorsScheme,
    ],
    options,
  }
}

export default presetWind
