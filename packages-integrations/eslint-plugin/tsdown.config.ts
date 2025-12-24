import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig([
  {
    entry: [
      'src/worker.ts',
    ],
    clean: true,
    failOnWarn: false,
    alias: aliasVirtual,
  },
  {
    entry: [
      'src/dirs.ts',
      'src/index.ts',
    ],
    clean: false,
    dts: true,
    format: ['esm', 'cjs'],
    external: [
      '@typescript-eslint/utils/ts-eslint',
      '@typescript-eslint/utils',
      '@typescript-eslint/types',
    ],
    alias: aliasVirtual,
    attw: {
      profile: 'esm-only',
    },
  },
])
