import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/worker.ts',
  ],
  clean: false,
  dts: true,
  exports: true,
  alias: aliasVirtual,
},
)
