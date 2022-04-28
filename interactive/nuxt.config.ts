import { defineNuxtConfig } from 'nuxt'
import Markdown from 'vite-plugin-md'
import LinkAttributes from 'markdown-it-link-attributes'
import { alias } from '../vitest.config'

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
  ],
  ssr: false,
  experimental: {
    reactivityTransform: true,
    viteNode: true,
  },
  unocss: {
    preflight: true,
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
    plugins: [
      Markdown({
        markdownItSetup(md) {
          md.use(LinkAttributes, {
            matcher: (link: string) => /^https?:\/\//.test(link),
            attrs: {
              target: '_blank',
              rel: 'noopener',
            },
          })
        },
      }),
    ],
  },
})
