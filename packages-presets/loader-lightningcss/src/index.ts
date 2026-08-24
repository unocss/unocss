import type { CSSLoader } from '@unocss/core'
import type { CustomAtRules, TransformOptions } from 'lightningcss'
import { Buffer } from 'node:buffer'
import { transform } from 'lightningcss'

export interface LoaderLightningCSSOptions extends Omit<TransformOptions<CustomAtRules>, 'code' | 'filename'> {

}

export default function loaderLightningCSS(
  options: LoaderLightningCSSOptions = {},
): CSSLoader {
  return {
    name: '@unocss/loader-lightningcss',
    load: (css, layer) => {
      const result = transform({
        ...options,
        code: Buffer.from(css),
        filename: `${layer ?? 'uno'}.css`,
      })
      return result.code.toString()
    },
  }
}
