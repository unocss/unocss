import { defineConfig, presetAttributify, presetUno, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify(),
    presetUno(),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
