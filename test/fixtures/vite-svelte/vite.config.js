import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import UnoCss from 'unocss/vite'
import presetIcons from '@unocss/preset-icons'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    UnoCss({
      mode: 'svelte',
      shortcuts: [
        { logo: 'i-logos-svelte-icon w-6em h-6em transform transition-800 hover:rotate-180' },
      ],
      presets: [
        presetAttributify(/* {
          // prefix: 'data-',
          // strict: false,
          // prefixedOnly: true,
          // nonValuedAttribute: true,
        } */),
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
