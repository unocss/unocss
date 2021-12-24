import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import UnoCss from 'unocss/vite'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'

export default defineConfig({
  plugins: [
    solidPlugin(),
    UnoCss({
      shortcuts: [
        { logo: 'i-logos-solid w-6em h-6em transform transition-800 hover:rotate-180' },
      ],
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
      inspector: true,
    }),
  ],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
})
