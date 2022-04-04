import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import presetWebFonts from '@unocss/preset-web-fonts'
/* eslint-disable no-restricted-imports */
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Roboto',
      },
    }),
  ],
})
