import { definePreset } from '@unocss/core'

const pxRE = /(-?[\.\d]+)px/g

export interface PxToViewportOptions {
  /**
   * design width
   */
  baseWidth: number
}

export default definePreset((options: PxToViewportOptions = {
  // iphone se
  baseWidth: 375,
}) => {
  const basicWidthUnit = options.baseWidth / 100
  return {
    name: '@unocss/preset-px-to-viewport',
    postprocess: (util) => {
      util.entries.forEach((i) => {
        const value = i[1]
        /**
         * issue:
         *      selector '.w-[\d]px' and '[w-[\d]px]' conflit
         *      css generate abnormal when change template in dev
         * temporary plan:
         *      match twice
         */
        if (typeof value !== 'string')
          return
        // No.1
        if (pxRE.test(value))
          i[1] = value.replace(pxRE, (_, p1) => `${p1 / basicWidthUnit}vmin`)

        // No.2
        if (pxRE.test(util.selector))
          i[1] = value.replace(pxRE, (_, p1) => `${p1 / basicWidthUnit}vmin`)
      })
    },
  }
})
