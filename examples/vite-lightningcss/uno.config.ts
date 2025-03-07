import { defineConfig, presetAttributify, presetIcons, presetWebFonts, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons(),
    presetWebFonts({
      fonts: {
        rounded: 'Bungee Hairline',
      },
    }),
  ],
})
