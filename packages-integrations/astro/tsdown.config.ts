import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  external: ['astro'],
  alias: aliasVirtual,
  exports: true,
  failOnWarn: true,
  publint: true,
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
