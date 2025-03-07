import extractorPug from '@unocss/extractor-pug'
import presetWind3 from '@unocss/preset-wind3'
import UnoCSS from '@unocss/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    Vue(),
    UnoCSS({
      presets: [
        presetWind3(),
      ],
      extractors: [
        extractorPug(),
      ],
    }),
  ],
})
