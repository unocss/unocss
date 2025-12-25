import { defineConfig } from 'tsdown'

export default defineConfig({
  attw: { profile: 'esm-only' },
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
