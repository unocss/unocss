import type { VitePluginConfig } from '@unocss/vite'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'

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
      // Keep the dark-tuned catppuccin file icons legible on a light surface —
      // invert/rehue/dim under light, cancel back to native color under `.dark`.
      // From @antfu/design's core tokens.
      'icon-catppuccin': 'invert-100 hue-rotate-180 brightness-80 dark:invert-0 dark:hue-rotate-0 dark:brightness-100',
    },
  }
}

export default createConfig()
