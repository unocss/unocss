import type { Preset } from '@unocss/core'

const remRE = /^-?[\.\d]+rem$/

export interface RemToPxOptions {
  /**
   * 1rem = n px
   * @default 16
   */
  baseFontSize?: number
}

export default (options: RemToPxOptions = {}): Preset => {
  const {
    baseFontSize = 16,
  } = options

  return {
    name: '@unocss/preset-rem-to-px',
    postprocess: (util) => {
      util.entries.forEach((i) => {
        const value = i[1]
        if (value && typeof value === 'string' && remRE.test(value))
          i[1] = `${+value.slice(0, -3) * baseFontSize}px`
      })
    },
  }
}
