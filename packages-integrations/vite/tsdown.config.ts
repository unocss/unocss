import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client.ts',
  ],
  clean: true,
  dts: true,
  alias: aliasVirtual,
  failOnWarn: true,
  publint: true,
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
