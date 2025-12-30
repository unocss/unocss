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
    '@jridgewell/trace-mapping',
    '@jridgewell/gen-mapping',
    '@jridgewell/set-array',
    '@jridgewell/sourcemap-codec',
    '@jridgewell/resolve-uri',
    '@unocss/core',
    '@unocss/config',
    '@unocss/preset-wind3',
    '@unocss/reset',
    'css-tree',
    'svelte',
    'vite',
  ],
  alias: aliasVirtual,
  attw: {
    profile: 'esm-only',
  },
})
