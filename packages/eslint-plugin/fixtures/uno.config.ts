// eslint-disable-next-line no-restricted-imports
import { defineConfig, presetUno, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
