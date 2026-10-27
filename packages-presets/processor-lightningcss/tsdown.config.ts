import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
    enabled: 'ci-only',
  },
  publint: 'ci-only',
  entry: [
    'src/index.ts',
  ],
  alias: aliasVirtual,
  exports: true,
  clean: true,
  dts: true,
})
