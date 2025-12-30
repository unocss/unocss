import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  external: [
    '@nuxt/schema',
    '@nuxt/kit',
    '@unocss/vite',
    '@unocss/webpack',
    'vite',
    'webpack',
  ],
  attw: {
    ignoreRules: [
      'false-export-default',
      'untyped-resolution',
    ],
  },
})
