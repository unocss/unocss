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
  failOnWarn: true,
  publint: true,
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
