import type { CSSLoader } from '@unocss/core'
import type { CustomAtRules, TransformOptions } from 'lightningcss'
import { getEnvFlags } from '#integration/env'

let wasmInitPromise: Promise<void> | undefined
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export interface LoaderLightningCSSOptions extends Omit<TransformOptions<CustomAtRules>, 'code' | 'filename'> {

}

export default function loaderLightningCSS(
  options: LoaderLightningCSSOptions = {},
): CSSLoader {
  return {
    name: '@unocss/loader-lightningcss',
    load: async (css, layer) => {
      const { isNode } = getEnvFlags()

      try {
        const filename = `${layer ?? 'uno'}.css`

        if (isNode) {
          const { Buffer } = await import('node:buffer')
          const { transform } = await import('lightningcss')
          const result = transform({
            code: Buffer.from(css),
            filename,
            ...options,
          })
          return result.code.toString()
        }
        else {
          const { default: init, transform } = await import('lightningcss-wasm')

          if (!wasmInitPromise)
            wasmInitPromise = init()
          await wasmInitPromise

          const result = transform({
            code: textEncoder.encode(css),
            filename,
            ...options,
          })

          return textDecoder.decode(result.code)
        }
      }
      catch {
        return css
      }
    },
  }
}
