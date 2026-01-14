import { defineConfig } from 'tsdown'

export default defineConfig({
  attw: { profile: 'esm-only' },
  entry: [
    'src/index.ts',
  ],
  external: [
    'lightningcss',
  ],
  clean: true,
  dts: true,
})
