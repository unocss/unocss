import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import UnoCSS from 'unocss/vite'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import { extractorDefault } from '@unocss/core'
import extractorSvelte from '@unocss/extractor-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS({
      extractors: [
        extractorDefault,
        extractorSvelte,
      ],
      shortcuts: [
        { logo: 'i-logos-svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
        { foo: 'bg-yellow-400' },
        { bar: 'bg-green-400' },
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
    svelte(),
  ],
})
