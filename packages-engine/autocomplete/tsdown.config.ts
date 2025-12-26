import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  attw: { profile: 'esm-only' },
  entry: [
    'src/index.ts',
  ],
  alias: aliasVirtual,
  clean: true,
  dts: true,
  external: [
    'pug',
    '@unocss/core',
  ],
})
