import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetIcons from '@unocss/preset-icons'
/* eslint-disable no-restricted-imports */
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: [
    { logo: 'i-logos-remix-icon w-3em h-3em transform transition-800 hover:rotate-360' },
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Roboto',
      },
    }),
    presetIcons(),
  ],
})
