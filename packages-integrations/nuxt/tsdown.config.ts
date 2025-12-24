import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  external: [
    '@nuxt/schema',
    '@nuxt/kit',
    '@unocss/vite',
    '@unocss/webpack',
    'vite',
    'webpack',
  ],
  alias: aliasVirtual,
  attw: {
    profile: 'esm-only',
    ignoreRules: [
      'false-esm',
    ],
  },
})
