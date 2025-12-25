import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  external: [
    'vite',
    '@unocss/vite',
    '@unocss/core',
  ],
  alias: aliasVirtual,
  attw: {
    profile: 'esm-only',
  },
})
