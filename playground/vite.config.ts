import { resolve } from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from '@unocss/vite'

export default defineConfig({
  resolve: {
    alias: {
      'unocss': resolve('../packages/unocss/src/index.ts'),
      '@unocss/core': resolve('../packages/core/src/index.ts'),
      '@unocss/vite': resolve('../packages/vite/src/index.ts'),
      '@unocss/preset-uno': resolve('../packages/preset-uno/src/index.ts'),
      '@unocss/preset-attributify': resolve('../packages/preset-attributify/src/index.ts'),
      '@unocss/preset-icons': resolve('../packages/preset-icons/src/index.ts'),
    },
  },
  plugins: [
    Vue(),
    Unocss(),
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
