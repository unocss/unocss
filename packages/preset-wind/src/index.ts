import type { Preset } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { presetMini } from '@unocss/preset-mini'

import { rules } from './rules'
import { shortcuts } from './shortcuts'
import { theme } from './theme'
import { variants } from './variants'

export { colors, preflights } from '@unocss/preset-mini'
export type { Theme } from '@unocss/preset-mini'

export { rules, shortcuts, theme, variants }

export interface PresetWindOptions extends PresetMiniOptions { }

export function presetWind(options: PresetWindOptions = {}): Preset<Theme> {
  return {
    ...presetMini(options),
    name: '@unocss/preset-wind',
    theme,
    rules,
    shortcuts,
    variants: variants(options),
  }
}

export default presetWind
