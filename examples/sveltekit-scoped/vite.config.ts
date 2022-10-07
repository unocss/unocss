import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import transformerDirective from '@unocss/transformer-directives'

export default defineConfig({
  plugins: [
    UnoCSS({
      mode: 'svelte-scoped-compiled',
      shortcuts: [
        { logo: 'i-logos:svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
      ],
      transformers: [
        transformerDirective(),
      ],
      presets: [
        presetUno(),
        presetIcons({
          prefix: 'i-',
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
      safelist: ['bg-orange-300'],
    }),
    sveltekit(),
  ],
})
