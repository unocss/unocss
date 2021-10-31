import Plugin, { UnocssPluginOptions } from '@unocss/vite'
import presetUno from '@unocss/preset-uno'
export * from '@unocss/vite'

export default function UnocssVitePlugin(configOrPath: UnocssPluginOptions | string) {
  return Plugin(
    configOrPath,
    {
      presets: [
        presetUno(),
      ],
    },
  )
}
