// This file will be compile to dual formats, while the rest of files are ESM-only.

import type { Result, Root } from 'postcss'
import type { UnoPostcssPluginOptions } from './types'

export * from './types'

function unocss(options: UnoPostcssPluginOptions = {}) {
  let promise: Promise<(root: Root, result: Result) => Promise<void>> | undefined

  return {
    postcssPlugin: options.directiveMap?.unocss || 'unocss',
    plugins: [
      async (root: Root, result: Result) => {
        if (!promise)
          promise = import('@unocss/postcss/esm').then(r => r.createPlugin(options))
        return await (await promise)(root, result)
      },
    ],
  }
}

unocss.postcss = true
unocss.default = unocss

export default unocss
