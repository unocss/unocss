import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/vite'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import transformDirectives from '@unocss/transformer-directives'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      UnoCSS({
        shortcuts: [
          { 'i-logo': 'i-logos-astro w-6em h-6em transform transition-800' },
        ],
        transformers: [
          transformDirectives(),
        ],
        presets: [
          presetUno(),
          presetIcons({
            extraProperties: {
              'display': 'inline-block',
              'vertical-align': 'middle',
            },
          }),
        ],
      }),
    ],
  },
})
