import type { PresetWind3Options, Theme } from '@unocss/preset-wind3'
import { definePreset } from '@unocss/core'
import { presetWind3 } from '@unocss/preset-wind3'

export type { Theme }

export interface PresetUnoOptions extends PresetWind3Options {}

/**
 * @deprecated Use `presetWind3` from `@unocss/preset-wind3` instead
 */
export const presetUno = definePreset((options: PresetUnoOptions = {}) => {
  const wind = presetWind3(options)
  return {
    ...wind,
    name: '@unocss/preset-uno',
  }
})

export default presetUno
