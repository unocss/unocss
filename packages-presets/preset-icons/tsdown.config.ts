import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/browser.ts',
    'src/core.ts',
  ],
  alias: aliasVirtual,
  clean: true,
  dts: true,
  external: [
    'ms',
    'jiti',
    'unconfig',
    '@unocss/config',
    '@unocss/core',
    'magic-string',
  ],
  attw: {
    profile: 'esm-only',
  },
})
