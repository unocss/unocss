import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from '@unocss/vite'
import { alias } from '../vitest.config'

export default defineConfig({
  resolve: {
    alias,
  },
  plugins: [
    Vue(),
    Unocss({
      transformCSS: true,
    }),
    Inspect(),
    Components({
      dirs: [
        'src/components',
        '../packages/inspector/client/components',
      ],
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
    rollupOptions: {
      external: [
        'local-pkg',
        'fs',
      ],
      input: [
        'index.html',
        '__play.html',
      ],
    },
  },
})
