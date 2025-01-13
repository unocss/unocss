import { definePreset } from '@unocss/core'

const remRE = /(-?[.\d]+)rem/g

export interface RemToPxOptions {
  /**
   * 1rem = n px
   * @default 16
   */
  baseFontSize?: number
}

/**
 * @see https://unocss.dev/presets/rem-to-px
 */
export const presetRemToPx = definePreset((options: RemToPxOptions = {}) => {
  const {
    baseFontSize = 16,
  } = options

  return {
    name: '@unocss/preset-rem-to-px',
    postprocess: (util) => {
      util.entries.forEach((i) => {
        const value = i[1]
        if (typeof value === 'string' && remRE.test(value))
          i[1] = value.replace(remRE, (_, p1) => `${p1 * baseFontSize}px`)
      })
    },
  }
})

export default presetRemToPx
