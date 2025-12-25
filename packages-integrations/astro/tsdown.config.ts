import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  external: [
    'astro',
    'vite',
    '@unocss/vite',
  ],
  alias: aliasVirtual,
  attw: {
    profile: 'esm-only',
  },
})
