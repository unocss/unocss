import { definePreset } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { presetWind } from '@unocss/preset-wind'
import { variantColorMix } from './variants/mix'

export type { Theme }

export interface PresetUnoOptions extends PresetMiniOptions {}

export const presetUno = definePreset<Theme, PresetUnoOptions | undefined>((options = {}) => {
  const wind = presetWind(options)
  return {
    ...wind,
    name: '@unocss/preset-uno',
    variants: [
      ...wind.variants!,
      variantColorMix(),
    ],
  }
}, {})

export default presetUno
