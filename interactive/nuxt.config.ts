import { resolve } from 'node:path'
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
    '@nuxt/devtools',
    '~/../packages/nuxt/src/index.ts',
    '~/modules/markdown',
  ],
  ssr: false,
  experimental: {
    reactivityTransform: true,
  },
  app: {
    baseURL: '/interactive/',
  },
  nitro: {
    preset: 'netlify',
    rootDir: resolve(__dirname, '..'),
    output: {
      publicDir: resolve(__dirname, '../docs/dist/interactive/'),
    },
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
  imports: {
    transform: {
      include: [/\.vue$/, /\.md$/],
    },
  },
  vite: {
    logLevel: 'info',
    vue: {
      include: [/\.vue$/, /\.md$/],
    },
    optimizeDeps: {
      exclude: externals,
    },
    define: {
      'process.env.VSCODE_TEXTMATE_DEBUG': 'false',
    },
    build: {
      rollupOptions: {
        external: externals,
      },
      target: 'esnext',
    },
  },
})
