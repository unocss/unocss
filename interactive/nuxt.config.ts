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

  devtools: {
    enabled: true,
  },

  modules: [
    '@vueuse/nuxt',
    '../packages-integrations/nuxt/src/index.ts',
    '~/modules/markdown',
  ],

  ssr: false,
  spaLoadingTemplate: './spa-loading-template.html',

  app: {
    baseURL: '/interactive/',
  },

  nitro: {
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

  vue: {
    propsDestructure: true,
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

  compatibilityDate: '2024-08-01',
})
