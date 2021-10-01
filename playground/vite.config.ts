import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Nanowind from '../src/vite-vue-sfc'
import { defaultTheme } from '../src'

export default defineConfig({
  plugins: [
    Vue(),
    Nanowind({
      theme: {
        ...defaultTheme,
        fontFamily: {
          ...defaultTheme.fontFamily,
          sans: '\'Inter\', sans-serif',
          mono: '\'Fira Code\', monospace',
        },
      },
    }),
    Inspect(),
    Components({
      dts: 'src/components.d.ts',
    }),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  build: {
    // minify: false,
  },
})
