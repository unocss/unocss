import presetAttributify from '@unocss/preset-attributify'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetWind3 from '@unocss/preset-wind3'

import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Roboto',
      },
    }),
  ],
})
