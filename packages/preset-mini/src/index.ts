import { Preset } from '@unocss/core'
import { rules } from './rules'
import { Theme, theme } from './theme'
import { variantColorsClass, variantColorsMedia, variants } from './variants'

export { theme, colors } from './theme'

export type { Theme }

export interface PresetMiniOptions {
  /**
   * @default 'class'
   */
  dark?: 'class' | 'media'
}

export const presetMini = (options: PresetMiniOptions = {}): Preset<Theme> => ({
  name: '@unocss/preset-mini',
  theme,
  rules,
  variants: [
    ...variants,
    ...options.dark === 'media'
      ? variantColorsMedia
      : variantColorsClass,
  ],
  options,
})

export default presetMini
