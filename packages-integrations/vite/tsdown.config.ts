import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client.ts',
  ],
  clean: true,
  dts: true,
  external: [
    'vite',
  ],
  alias: aliasVirtual,
  attw: {
    profile: 'esm-only',
  },
})
