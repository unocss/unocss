import type { Preset } from '@unocss/core'

const remRE = /(-?[\.\d]+)rem/g

export interface RemToPxOptions {
  /**
   * 1rem = n px
   * @default 16
   */
  baseFontSize?: number
}

export default function remToPxPreset(options: RemToPxOptions = {}): Preset {
  const {
    baseFontSize = 16,
  } = options

  return {
    name: '@unocss/preset-rem-to-px',
    postprocess: (util) => {
      util.entries.forEach((i) => {
        const value = i[1]
        if (value && typeof value === 'string' && remRE.test(value))
          i[1] = value.replace(remRE, (_, p1) => `${p1 * baseFontSize}px`)
      })
    },
  }
}
