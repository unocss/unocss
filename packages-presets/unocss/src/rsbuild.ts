import type { RsbuildPlugin } from '@rsbuild/core'
import type { UnoCSSRsbuildPluginOptions } from '@unocss/rsbuild'
import presetWind3 from '@unocss/preset-wind3'
import { pluginUnoCSS } from '@unocss/rsbuild'

export * from '@unocss/rsbuild'

/**
 * 创建带有默认 Wind3 预设的 UnoCSS Rsbuild 插件。
 *
 * @param options Rsbuild integration 配置，可覆盖扫描范围、配置文件和默认 UnoCSS 配置。
 * @returns 可直接加入 Rsbuild `plugins` 的插件实例。
 */
export default function UnocssRsbuildPlugin<Theme extends object>(
  options: UnoCSSRsbuildPluginOptions<Theme> = {},
): RsbuildPlugin {
  return pluginUnoCSS({
    ...options,
    defaults: {
      presets: [presetWind3()],
      ...options.defaults,
    },
  })
}
