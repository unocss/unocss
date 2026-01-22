import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  alias: aliasVirtual,
  clean: true,
  dts: true,
  exports: true,
  failOnWarn: true,
  publint: 'ci-only',
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
