import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  external: [
    'unconfig',
    'magic-string',
  ],
})
