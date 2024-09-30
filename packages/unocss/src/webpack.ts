import type { WebpackPluginOptions } from '@unocss/webpack'
import presetUno from '@unocss/preset-uno'
import WebpackPlugin from '@unocss/webpack'

export * from '@unocss/webpack'

export default function UnocssWebpackPlugin<Theme extends object>(
  configOrPath?: WebpackPluginOptions<Theme> | string,
) {
  return WebpackPlugin<Theme>(
    configOrPath,
    {
      presets: [
        presetUno(),
      ],
    },
  ) as any
}
