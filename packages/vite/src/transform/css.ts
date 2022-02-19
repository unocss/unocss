import { createFilter } from '@rollup/pluginutils'
import { transformCSS } from '@unocss/css-transform'
import type { Plugin, ResolvedConfig } from 'vite'
import type { UnocssPluginContext } from '../../../plugins-common'
import { resolveId } from '../../../plugins-common'

const defaultIncludes = [/\.(?:postcss|pcss|scss|sass|css|stylus|less)(?:$|\?)/i]

export function transformCSSPlugin({ uno, ready }: UnocssPluginContext): Plugin {
  let filter = createFilter(defaultIncludes, [])
  let viteConfig: ResolvedConfig

  return {
    name: 'unocss:css',
    async configResolved(_viteConfig) {
      const { config } = await ready
      filter = createFilter(
        config.include || defaultIncludes,
        config.exclude || [],
      )
      viteConfig = _viteConfig
    },
    async transform(code, id) {
      if (!filter(id) || resolveId(id))
        return
      code = await transformCSS(code, uno, id)
      return viteConfig.build.sourcemap
        ? {
          code,
          map: { mappings: '' },
        }
        : code
    },
  }
}
