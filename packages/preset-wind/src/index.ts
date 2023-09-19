import { definePreset } from '@unocss/core'
import type { PresetMiniOptions } from '@unocss/preset-mini'
import { presetMini } from '@unocss/preset-mini'

import { rules } from './rules'
import { shortcuts } from './shortcuts'
import { theme } from './theme'
import { variants } from './variants'

export { colors, preflights } from '@unocss/preset-mini'
export type { Theme } from '@unocss/preset-mini'

export { rules, shortcuts, theme, variants }

export interface PresetWindOptions extends PresetMiniOptions { }

export const presetWind = definePreset((options: PresetWindOptions = {}) => {
  return {
    ...presetMini(options),
    name: '@unocss/preset-wind',
    theme,
    rules,
    shortcuts,
    variants: variants(options),
  }
})

export default presetWind
