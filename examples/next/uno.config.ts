import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      dark: 'media',
    }),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
