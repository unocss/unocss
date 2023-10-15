import { definePreset } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { presetWind, shortcuts as windiShortcuts } from '@unocss/preset-wind'
import { variantColorMix } from './variants/mix'
import { mediaHover } from './shortcuts/mediaHover'

export type { Theme }

export interface PresetUnoOptions extends PresetMiniOptions {}

export const presetUno = definePreset((options: PresetUnoOptions = {}) => {
  const wind = presetWind(options)
  return {
    ...wind,
    name: '@unocss/preset-uno',
    variants: [
      ...wind.variants!,
      variantColorMix<Theme>(),
    ],
    shortcuts: [
      ...windiShortcuts,
      ...mediaHover,
    ],
  }
})

export default presetUno
