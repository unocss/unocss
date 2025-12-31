import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  alias: aliasVirtual,
  clean: true,
  dts: true,
  external: [
    'magic-string',
    '@babel/parser',
    '@babel/traverse',
  ],
  attw: {
    profile: 'esm-only',
  },
})
