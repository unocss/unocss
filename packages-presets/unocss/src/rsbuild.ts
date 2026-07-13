import type { RsbuildPlugin } from '@rsbuild/core'
import type { UnoCSSRsbuildPluginOptions } from '@unocss/rsbuild'
import { pluginUnoCSS } from '@unocss/rsbuild'

export * from '@unocss/rsbuild'

export default function UnocssRsbuildPlugin<Theme extends object>(
  options: UnoCSSRsbuildPluginOptions<Theme> = {},
): RsbuildPlugin {
  return pluginUnoCSS(options)
}
