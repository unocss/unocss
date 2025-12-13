import { defineConfig } from 'tsdown'
import { alias } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cli.ts',
  ],
  clean: true,
  dts: true,
  alias,
})
