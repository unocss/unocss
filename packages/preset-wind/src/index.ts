import type { Preset } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { variants } from '@unocss/preset-mini/variants'
import { rules } from './rules'
import { containerShortcuts } from './rules/container'
import { theme } from './theme'
import { variantColorsScheme } from './variants'

export { colors } from '@unocss/preset-mini'

export type { Theme } from '@unocss/preset-mini'

export { theme }

export interface UnoOptions {
  /**
   * @default 'class'
   */
  dark?: 'class' | 'media'
  /**
   * @default false
   */
  attributifyPseudo?: Boolean
}

export const presetWind = (options: UnoOptions = {}): Preset<Theme> => ({
  name: '@unocss/preset-wind',
  theme,
  rules,
  shortcuts: [
    ...containerShortcuts,
  ],
  variants: [
    ...variants(options),
    ...variantColorsScheme,
  ],
  options,
})

export default presetWind
