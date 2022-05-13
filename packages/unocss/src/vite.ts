import type { VitePluginConfig } from '@unocss/vite'
import VitePlugin from '@unocss/vite'
import presetUno from '@unocss/preset-uno'
import type { Plugin } from 'vite'

export * from '@unocss/vite'

export default function UnocssVitePlugin<Theme extends {}>(
  configOrPath?: VitePluginConfig<Theme> | string,
): Plugin[] {
  return VitePlugin(
    configOrPath,
    {
      presets: [
        presetUno(),
      ],
    },
  )
}
