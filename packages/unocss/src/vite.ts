import VitePlugin, { UnocssPluginOptions } from '@unocss/vite'
import presetUno from '@unocss/preset-uno'
import { Plugin } from 'vite'
export * from '@unocss/vite'

export default function UnocssVitePlugin(configOrPath?: UnocssPluginOptions | string): Plugin[] {
  return VitePlugin(
    configOrPath,
    {
      presets: [
        presetUno(),
      ],
    },
  )
}
