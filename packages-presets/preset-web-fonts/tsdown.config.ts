import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/local.ts',
  ],
  clean: true,
  dts: true,
  alias: aliasVirtual,
})
