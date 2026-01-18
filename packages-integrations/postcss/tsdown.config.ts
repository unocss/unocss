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
    failOnWarn: true,
    publint: true,
    attw: {
      ignoreRules: ['cjs-resolves-to-esm'],
    },
  },
])
