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
  exports: true,
  failOnWarn: true,
  publint: 'ci-only',
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
