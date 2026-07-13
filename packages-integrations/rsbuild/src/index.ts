import type { RsbuildPlugin } from '@rsbuild/core'
import type { UnoCSSRsbuildPluginOptions } from './types'
import { UnoCSSRspackPlugin } from './rspack'

export { UnoCSSRspackPlugin, unoCSSRspackPlugin } from './rspack'
export type { UnoCSSRsbuildPluginOptions, UnoCSSRspackPluginOptions } from './types'

export function pluginUnoCSS<Theme extends object = object>(
  options: UnoCSSRsbuildPluginOptions<Theme> = {},
): RsbuildPlugin {
  return {
    name: 'unocss:rsbuild',
    enforce: 'pre',
    setup(api) {
      api.modifyRspackConfig((config) => {
        config.plugins ??= []
        config.plugins.unshift(new UnoCSSRspackPlugin({
          ...options,
          root: options.root ?? api.context.rootPath,
          autoCssRule: false,
        }))
      })
    },
  }
}
