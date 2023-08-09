import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import type { VitePluginConfig } from '@unocss/vite'
import presetIcons from '@unocss/preset-icons'

export function createConfig(): VitePluginConfig {
  return {
    envMode: 'dev',
    details: true,
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
      'border-main': 'border-gray:20',
      'bg-active': 'bg-gray:8',
    },
  }
}

export default createConfig()
