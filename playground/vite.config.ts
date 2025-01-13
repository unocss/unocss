import UnoCSS from '@unocss/vite'
import Vue from '@vitejs/plugin-vue'
import SimpleGit from 'simple-git'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import { alias } from '../alias'

const git = SimpleGit()

const SHA = await git.revparse(['HEAD'])
const LASTEST_TAG = (await git.raw(['describe', '--tags', '--abbrev=0'])).trim()
const LASTEST_TAG_SHA = await git.revparse([LASTEST_TAG])

export default defineConfig({
  base: '/play/',
  resolve: {
    alias,
  },
  define: {
    __SHA__: JSON.stringify(SHA),
    __LASTEST_TAG__: JSON.stringify(LASTEST_TAG),
    __LASTEST_TAG_SHA__: JSON.stringify(LASTEST_TAG_SHA),
  },
  plugins: [
    Vue(),
    UnoCSS({
      // hmrTopLevelAwait: false, // Related to #2066
    }),
    Inspect(),
    Components({
      dirs: [
        'src/components',
        '../packages-integrations/inspector/client/components',
      ],
      dts: 'src/components.d.ts',
    }),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        '@vueuse/math',
      ],
      dirs: [
        'src/composables',
      ],
      vueTemplate: true,
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  optimizeDeps: {
    exclude: [
      '@iconify/utils/lib/loader/fs',
      '@iconify/utils/lib/loader/install-pkg',
      '@iconify/utils/lib/loader/node-loader',
      '@iconify/utils/lib/loader/node-loaders',
    ],
  },
  build: {
    outDir: '../docs/dist/play',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        '@iconify/utils/lib/loader/fs',
        '@iconify/utils/lib/loader/install-pkg',
        '@iconify/utils/lib/loader/node-loader',
        '@iconify/utils/lib/loader/node-loaders',
      ],
      input: [
        './index.html',
        './__play.html',
      ],
    },
  },
})
