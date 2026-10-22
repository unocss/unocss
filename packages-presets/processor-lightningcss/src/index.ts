import type { CSSProcessor } from '@unocss/core'
import type { CustomAtRules, TransformOptions } from 'lightningcss'
import { warnOnce } from '@unocss/core'
import { getEnvFlags } from '#integration/env'

export interface ProcessorLightningCSSOptions extends Omit<TransformOptions<CustomAtRules>, 'code' | 'filename'> {

}

export default function processorLightningCSS(
  options: ProcessorLightningCSSOptions = {},
): CSSProcessor {
  return {
    name: '@unocss/processor-lightningcss',
    process: async (css, { layer, envMode }) => {
      if (!getEnvFlags().isNode) {
        warnOnce('@unocss/processor-lightningcss is not supported in non-Node.js environments; returning CSS unchanged')
        return css
      }

      const [{ Buffer }, { transform }] = await Promise.all([
        import('node:buffer'),
        import('lightningcss'),
      ])
      const result = transform({
        code: Buffer.from(css),
        filename: `${layer ?? 'uno'}.css`,
        minify: envMode === 'build',
        ...options,
      })
      return result.code.toString()
    },
  }
}
