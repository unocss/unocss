import type { Theme } from '@unocss/preset-mini'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'

export default defineConfig<Theme>({
  rules: [
    ['custom-rule', { color: 'red' }]
  ],
  shortcuts: {
    'custom-shortcut': 'text-lg text-orange hover:text-teal'
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    }),
  ]
})
