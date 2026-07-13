import type { RsbuildPlugin } from '@rsbuild/core'
import type { UnoCSSRsbuildPluginOptions } from '@unocss/rsbuild'
import presetWind3 from '@unocss/preset-wind3'
import { pluginUnoCSS } from '@unocss/rsbuild'

export * from '@unocss/rsbuild'

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
