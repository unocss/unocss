import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import UnoCSS from 'unocss/vite'
import { extractorSvelte, presetIcons, presetUno } from 'unocss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS({
      extractors: [extractorSvelte],
      shortcuts: [
        { logo: 'i-logos-svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
        { myyellow: 'bg-yellow-400' },
        { 'special-green-shortcut': 'bg-green-400' },
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
