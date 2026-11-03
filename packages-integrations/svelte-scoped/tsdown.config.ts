import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/preprocess.ts',
    'src/vite.ts',
  ],
  clean: true,
  dts: true,
  deps: {
    neverBundle: [
      'svelte',
      'vite',
    ],
  },
  alias: aliasVirtual,
  exports: true,
  failOnWarn: true,
  publint: 'ci-only',
  attw: {
    enabled: 'ci-only',
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
