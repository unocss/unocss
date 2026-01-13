import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/preprocess.ts',
    'src/vite.ts',
  ],
  clean: true,
  dts: true,
  external: [
    '@jridgewell/remapping',
    'prettier-plugin-svelte',
    'svelte',
    'vite',
  ],
  alias: aliasVirtual,
  attw: {
    profile: 'esm-only',
  },
})
