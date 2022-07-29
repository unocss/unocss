import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import type { VitePluginConfig } from '@unocss/vite'
import presetIcons from '@unocss/preset-icons'

export function createConfig(): VitePluginConfig {
  return {
    envMode: 'build',
    theme: {
      fontFamily: {
        sans: '\'Inter\', sans-serif',
        mono: '\'Fira Code\', monospace',
      },
    },
    presets: [
      presetAttributify(),
      presetIcons({
        extraProperties: {
          'display': 'inline-block',
          'height': '1.2em',
          'width': '1.2em',
          'vertical-align': 'text-bottom',
        },
      }),
      presetUno(),
    ],
    shortcuts: {
      'b-main': 'border-gray-400 border-opacity-30',
      'bg-main': 'bg-gray-405',
    },
  }
}

export default createConfig()
