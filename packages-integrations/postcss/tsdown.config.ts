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
  },
  {
    entry: [
      'src/index.ts',
    ],
    dts: true,
    external: [
      /postcss\/esm/,
    ],
    alias: aliasVirtual,
    attw: {
      profile: 'esm-only',
    },
  },
])
