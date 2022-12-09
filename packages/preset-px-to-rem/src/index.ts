import type { Preset } from '@unocss/core'

const pxRE = /(-?[\.\d]+)px/g

export interface PxToRemOptions {
  /**
   * 75px = 1 rem
   * @default 75
   */
  rootValue?: number
  /**
   * precision
   * @default 5
   */
   unitPrecision?: number
}

export default function remToPxPreset(options: PxToRemOptions = {}): Preset {
  const {
    rootValue = 75,
    unitPrecision = 5,
  } = options

  return {
    name: '@unocss/preset-px-to-rem',
    postprocess: (util) => {
      util.entries.forEach((i) => {
        const value = i[1]
        if (value && typeof value === 'string' && pxRE.test(value))
          i[1] = value.replace(pxRE, (_, p1) => `${(p1 / rootValue).toFixed(unitPrecision)}rem`)
      })
    },
  }
}
