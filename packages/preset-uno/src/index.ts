import { Preset } from '@unocss/core'
import { rules } from './rules'
import { containerShortcuts } from './rules/container'
import { Theme, theme } from './theme'
import { variantColorsClass, variantColorsMedia, variants } from './variants'

export { theme, colors } from './theme'

export interface UnoOptions {
  /**
   * @default 'class'
   */
  dark?: 'class' | 'media'
}

export const preset = (options: UnoOptions = {}): Preset<Theme> => ({
  name: '@unocss/preset-uno',
  theme,
  rules,
  variants: [
    ...variants,
    ...options.dark === 'media'
      ? variantColorsMedia
      : variantColorsClass,
  ],
  shortcuts: [
    ...containerShortcuts,
  ],
})

export default preset
