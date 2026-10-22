import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  dts: true,
  alias: aliasVirtual,
  deps: {
    neverBundle: [
      'rolldown',
      'rollup',
    ],
  },
  exports: true,
  failOnWarn: true,
  publint: 'ci-only',
  attw: {
    enabled: 'ci-only',
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
