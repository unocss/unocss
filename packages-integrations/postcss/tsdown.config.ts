import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig([
  {
    entry: [
      'src/esm.ts',
    ],
    clean: true,
    dts: true,
    alias: aliasVirtual,
    exports: true,
  },
  {
    entry: [
      'src/index.ts',
    ],
    dts: true,
    format: ['esm', 'cjs'],
    external: [
      /postcss\/esm/,
    ],
    alias: aliasVirtual,
    outputOptions: {
      exports: 'named',
    },
    exports: true,
    failOnWarn: true,
    publint: true,
    attw: {
      ignoreRules: ['cjs-resolves-to-esm'],
    },
  },
])
