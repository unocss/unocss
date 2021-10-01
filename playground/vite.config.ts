import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Nanowind from '../src/vite-vue-sfc'

export default defineConfig({
  plugins: [
    Vue(),
    Nanowind(),
    Inspect(),
    Components({
      dts: 'src/components.d.ts',
    }),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core'
      ],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  build: {
    // minify: false,
  },
})
