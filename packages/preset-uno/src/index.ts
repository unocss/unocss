import { definePreset } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { presetWind } from '@unocss/preset-wind'
import { variantColorMix } from './variants/mix'

export type { Theme }

export interface PresetUnoOptions extends PresetMiniOptions {}

/**
 * The defult UnoCSS preset, provide Tailwind-like utilities with some additional features.
 *
 * @see https://unocss.dev/presets/uno
 */
export const presetUno = definePreset((options: PresetUnoOptions = {}) => {
  const wind = presetWind(options)
  return {
    ...wind,
    name: '@unocss/preset-uno',
    variants: [
      ...wind.variants!,
      variantColorMix<Theme>(),
    ],
  }
})

export default presetUno
