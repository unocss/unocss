import { definePreset } from '@unocss/core'
import { toCommaStyleColorFunction } from './comma-color'

export interface LegacyCompatOptions {
  /**
   * Convert modern space style color function to comma style.
   *
   * @example `rgb(255 0 0)` -> `rgb(255, 0, 0)`
   * @example `rgba(255 0 0 / 0.5)` -> `rgba(255, 0, 0, 0.5)`
   *
   * @default false
   */
  commaStyleColorFunction?: boolean
}

/**
 * @see https://unocss.dev/presets/legacy-compat
 */
export const presetLegacyCompat = definePreset((options: LegacyCompatOptions = {}) => {
  const {
    commaStyleColorFunction = false,
  } = options

  return {
    name: '@unocss/preset-legacy-compat',
    postprocess: (util) => {
      util.entries.forEach((i) => {
        let value = i[1]
        if (typeof value !== 'string')
          return
        if (commaStyleColorFunction)
          value = toCommaStyleColorFunction(value)
        if (value !== i[1])
          i[1] = value
      })
    },
  }
})

export default presetLegacyCompat
