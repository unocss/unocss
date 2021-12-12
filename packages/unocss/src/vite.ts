import type { VitePluginConfig } from '@unocss/vite'
import VitePlugin from '@unocss/vite'
import presetUno from '@unocss/preset-uno'
import type { Plugin } from 'vite'

export * from '@unocss/vite'

export default function UnocssVitePlugin(configOrPath?: VitePluginConfig | string): Plugin[] {
  return VitePlugin(
    configOrPath,
    {
      presets: [
        presetUno(),
      ],
    },
  )
}
