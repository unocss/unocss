import type { VitePluginConfig } from '@unocss/vite'
import presetWind3 from '@unocss/preset-wind3'
import VitePlugin from '@unocss/vite'

export * from '@unocss/vite'

export default function UnocssVitePlugin<Theme extends object>(
  configOrPath?: VitePluginConfig<Theme> | string,
) {
  return VitePlugin(
    configOrPath,
    {
      presets: [
        presetWind3(),
      ],
    },
  )
}
