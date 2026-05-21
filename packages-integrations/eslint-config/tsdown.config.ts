import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/flat.ts',
  ],
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  exports: true,
  failOnWarn: true,
  publint: 'ci-only',
  attw: 'ci-only',
})
