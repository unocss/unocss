import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Unocss from '@unocss/vite'
import { extractorSplit } from '@unocss/core'
import extractorPug from '@unocss/extractor-pug'
import presetUno from '@unocss/preset-uno'

export default defineConfig({
  plugins: [
    Vue(),
    Unocss({
      presets: [
        presetUno(),
      ],
      extractors: [
        extractorSplit,
        extractorPug(),
      ],
    }),
    Inspect(),
  ],
})
