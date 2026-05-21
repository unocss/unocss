import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/rspack.ts',
  ],
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  alias: aliasVirtual,
  outputOptions: {
    exports: 'named',
  },
  exports: true,
  failOnWarn: true,
  publint: 'ci-only',
  attw: 'ci-only',
})
