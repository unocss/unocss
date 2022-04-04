import { defineConfig } from 'vite'
import elmPlugin from 'vite-plugin-elm'
import UnoCSS from 'unocss/vite'
import { presetUno } from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  plugins: [
    elmPlugin(),
    UnoCSS({
      shortcuts: [
        { logo: 'i-logos-elm w-6em h-6em transform transition-800 hover:rotate-360' },
      ],
      presets: [
        presetUno(),
        presetIcons(),
      ],
    }),
  ],
})
