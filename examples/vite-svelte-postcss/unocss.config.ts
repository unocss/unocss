import {
  defineConfig,
  extractorDefault,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
} from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'

export default defineConfig({
  extractors: [
    extractorDefault,
    extractorSvelte,
  ],
  presets: [
    presetUno({
      attributifyPseudo: true,
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      provider: 'none',
      fonts: {
        script: 'Homemade Apple',
      },
    }),
  ],
})
