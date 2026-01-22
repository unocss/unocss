import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig([
  {
    entry: [
      'src/worker.ts',
    ],
    clean: true,
    alias: aliasVirtual,
    exports: true,
  },
  {
    entry: [
      'src/index.ts',
    ],
    clean: false,
    dts: true,
    format: ['esm', 'cjs'],
    external: [
      '@typescript-eslint/types',
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
