import type { WebpackPluginOptions } from '@unocss/webpack'
import WebpackPlugin from '@unocss/webpack'
import presetUno from '@unocss/preset-uno'

export * from '@unocss/webpack'

export default function UnocssWebpackPlugin<Theme extends {}>(
  configOrPath?: WebpackPluginOptions<Theme> | string,
) {
  return WebpackPlugin<Theme>(
    configOrPath,
    {
      presets: [
        presetUno(),
      ],
    },
  )
}
