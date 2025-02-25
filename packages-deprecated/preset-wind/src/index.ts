import type { PresetWind3Options, Theme } from '@unocss/preset-wind3'
import { definePreset } from '@unocss/core'
import { presetWind3 } from '@unocss/preset-wind3'

export type { Theme }

export interface PresetWindOptions extends PresetWind3Options {}

/**
 * @deprecated Use `presetWind3` from `@unocss/preset-wind3` instead
 */
export const presetWind = definePreset((options: PresetWindOptions = {}) => {
  const wind = presetWind3(options)
  return {
    ...wind,
    name: '@unocss/preset-wind',
  }
})

export default presetWind
