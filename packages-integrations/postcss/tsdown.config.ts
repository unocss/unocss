import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig([
  {
    entry: [
      'src/esm.ts',
    ],
    clean: true,
    dts: true,
    failOnWarn: false,
    alias: aliasVirtual,
  },
  {
    name: 'CJS Dts only',
    entry: [
      'src/esm.ts',
    ],
    clean: false,
    dts: {
      emitDtsOnly: true,
    },
    failOnWarn: false,
    alias: aliasVirtual,
    outExtensions() {
      return {
        dts: '.d.ts',
      }
    },
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
    attw: {
      ignoreRules: ['cjs-resolves-to-esm'],
    },
    outputOptions: {
      exports: 'named',
    },
  },
])
