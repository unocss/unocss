import type { Preset } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { theme } from '@unocss/preset-mini/theme'
import { variantColorsClass, variantColorsMedia, variants as miniVariants } from '@unocss/preset-mini/variants'
import { rules } from './rules'
import { containerShortcuts } from './rules/container'
import { variantColorsScheme } from './variants'

export { theme, colors } from '@unocss/preset-mini'

export type { Theme } from '@unocss/preset-mini'

export interface UnoOptions {
  /**
   * @default 'class'
   */
  dark?: 'class' | 'media'
}

export const presetWind = (options: UnoOptions = {}): Preset<Theme> => ({
  name: '@unocss/preset-wind',
  theme,
  rules,
  shortcuts: [
    ...containerShortcuts,
  ],
  variants: [
    ...miniVariants,
    ...variantColorsScheme,
    ...options.dark === 'media'
      ? variantColorsMedia
      : variantColorsClass,
  ],
  options,
})

export default presetWind
