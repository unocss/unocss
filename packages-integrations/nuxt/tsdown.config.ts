import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  outputOptions: {
    exports: 'named',
  },
  failOnWarn: true,
  publint: true,
  attw: true,
})
