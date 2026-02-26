import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  alias: aliasVirtual,
  clean: true,
  dts: true,
  external: ['@unocss/core'],
  exports: true,
  failOnWarn: true,
  publint: 'ci-only',
  attw: {
    enabled: 'ci-only',
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
