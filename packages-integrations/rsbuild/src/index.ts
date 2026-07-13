import type { RsbuildPlugin } from '@rsbuild/core'
import type { UnoCSSRsbuildPluginOptions } from './types'
import { UnoCSSRspackPlugin } from './rspack'

export { UnoCSSRspackPlugin, unoCSSRspackPlugin } from './rspack'
export type { UnoCSSRsbuildPluginOptions, UnoCSSRspackPluginOptions } from './types'

/**
 * 创建原生 UnoCSS Rsbuild 插件。
 *
 * @param options UnoCSS 与 Rspack integration 配置。
 * @returns 可加入 Rsbuild `plugins` 的插件实例。
 */
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
