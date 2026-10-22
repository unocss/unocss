import presetWind4 from '@unocss/preset-wind4'
import UnoCSS from '@unocss/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    Vue(),
    UnoCSS({
      mode: 'vue-scoped',
      presets: [
        presetWind4(),
      ],
    }),
  ],
})