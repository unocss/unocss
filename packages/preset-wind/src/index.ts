import { Preset } from '@unocss/core'
import { presetMini, Theme } from '@unocss/preset-mini'
import { rules } from './rules'
import { containerShortcuts } from './rules/container'

export { theme, colors } from '@unocss/preset-mini'

export type { Theme } from '@unocss/preset-mini'

export interface UnoOptions {
  /**
   * @default 'class'
   */
  dark?: 'class' | 'media'
}

export const presetWind = (options: UnoOptions = {}): Preset<Theme>[] => ([
  presetMini(),
  {
    name: '@unocss/preset-wind',
    rules,
    shortcuts: [
      ...containerShortcuts,
    ],
    options,
  },
])

export default presetWind
