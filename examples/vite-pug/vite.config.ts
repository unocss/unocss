import extractorPug from '@unocss/extractor-pug'
import presetUno from '@unocss/preset-uno'
import UnoCSS from '@unocss/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    Vue(),
    UnoCSS({
      presets: [
        presetUno(),
      ],
      extractors: [
        extractorPug(),
      ],
    }),
  ],
})
