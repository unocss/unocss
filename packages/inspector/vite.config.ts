import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Pages from 'vite-plugin-pages'
import UnoCSS from 'unocss/vite'
import { alias } from '../../alias'

export default defineConfig(({ command }) => ({
  resolve: {
    alias,
  },
  base: command === 'build' ? '/__unocss/' : '/',
  plugins: [
    UnoCSS('unocss.config.ts'),
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
      dirs: 'client/pages',
    }),
  ],
  build: {
    outDir: 'dist/client',
  },
}))
