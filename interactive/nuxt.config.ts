import { defineNuxtConfig } from 'nuxt'

import { alias } from '../alias'

const externals = [
  'local-pkg',
  '@iconify/utils/lib/loader/fs',
  '@iconify/utils/lib/loader/install-pkg',
  '@iconify/utils/lib/loader/node-loader',
  '@iconify/utils/lib/loader/node-loaders',
]

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
  postcss: {
    plugins: {
      'postcss-nested': {},
    },
  },
  components: {
    dirs: [
      './components',
    ],
    transform: {
      include: [/\.vue$/, /\.md$/],
    },
  },
  autoImports: {
    transform: {
      include: [/\.vue$/, /\.md$/],
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
