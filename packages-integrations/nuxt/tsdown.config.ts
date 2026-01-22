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
  exports: true,
  failOnWarn: true,
  publint: 'ci-only',
  attw: 'ci-only',
})
