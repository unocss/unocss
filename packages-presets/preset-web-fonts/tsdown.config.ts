import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  attw: { profile: 'esm-only' },
  entry: [
    'src/index.ts',
    'src/local.ts',
  ],
  clean: true,
  dts: true,
  alias: aliasVirtual,
})
