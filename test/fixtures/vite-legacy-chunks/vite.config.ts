import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'

import { presetUno } from 'unocss'
import Unocss from 'unocss/vite'

import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Unocss({
      presets: [presetUno()],
      legacy: {
        renderModernChunks: false,
      },
    }),
    legacy({
      targets: ['defaults', 'not IE 11'],
      renderModernChunks: false,
    }),
  ],
})
