import {
  defineConfig,
  presetIcons,
  presetWind4,
  transformerCompileClass,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  // these rewrite your source, so they need @unocss/next rather than @unocss/postcss
  transformers: [
    transformerVariantGroup(),
    transformerCompileClass(),
  ],
})
