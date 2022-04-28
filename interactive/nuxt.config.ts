import { defineNuxtConfig } from 'nuxt'

import { alias } from '../vitest.config'

const externals = [
  'local-pkg',
  '@iconify/utils/lib/loader/fs',
  '@iconify/utils/lib/loader/install-pkg',
  '@iconify/utils/lib/loader/node-loader',
  '@iconify/utils/lib/loader/node-loaders',
]

// @ts-expect-error ignore
export default defineNuxtConfig({
  alias,
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '~/modules/markdown',
  ],
  ssr: false,
  experimental: {
    reactivityTransform: true,
    viteNode: true,
  },
  unocss: {
    preflight: true,
  },
  postcss: {
    plugins: {
      'postcss-nested': {},
    },
  },
  vite: {
    // @ts-expect-error any
    vue: {
      include: [/\.vue$/, /\.md$/],
    },
    optimizeDeps: {
      exclude: externals,
    },
    build: {
      rollupOptions: {
        external: externals,
      },
      target: 'esnext',
    },
  },
})
