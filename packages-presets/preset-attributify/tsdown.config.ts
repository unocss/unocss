import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  exports: true,
  failOnWarn: true,
  publint: true,
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
