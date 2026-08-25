import type { CSSLoader } from '@unocss/core'
import type { CustomAtRules, TransformOptions } from 'lightningcss'
import { warnOnce } from '@unocss/core'
import { getEnvFlags } from '#integration/env'

export interface LoaderLightningCSSOptions extends Omit<TransformOptions<CustomAtRules>, 'code' | 'filename'> {

}

export default function loaderLightningCSS(
  options: LoaderLightningCSSOptions = {},
): CSSLoader {
  return {
    name: '@unocss/loader-lightningcss',
    load: async (css, layer) => {
      if (!getEnvFlags().isNode) {
        warnOnce('@unocss/loader-lightningcss is not supported in non-Node.js environments; returning CSS unchanged')
        return css
      }

      const [{ Buffer }, { transform }] = await Promise.all([
        import('node:buffer'),
        import('lightningcss'),
      ])
      const result = transform({
        ...options,
        code: Buffer.from(css),
        filename: `${layer ?? 'uno'}.css`,
      })
      return result.code.toString()
    },
  }
}
