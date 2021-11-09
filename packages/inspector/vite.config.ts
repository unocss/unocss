import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'
import Pages from 'vite-plugin-pages'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/__unocss' : '/',
  plugins: [
    Unocss('unocss.config.ts'),
    Vue(),
    Components({
      dirs: 'client/components',
      dts: 'client/components.d.ts',
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
      ],
      dts: 'client/auto-imports.d.ts',
    }),
    Pages({
      pagesDir: 'client/pages',
    }),
  ],
  build: {
    outDir: 'dist/client',
  },
}))
