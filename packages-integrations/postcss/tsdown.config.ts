import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig([
  {
    entry: [
      'src/esm.ts',
    ],
    clean: true,
    dts: true,
    format: ['esm', 'cjs'],
    failOnWarn: false,
    alias: aliasVirtual,
    outExtensions(ctx) {
      if (ctx.format === 'cjs') {
        return {
          js: '.js',
          dts: '.d.ts',
        }
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
