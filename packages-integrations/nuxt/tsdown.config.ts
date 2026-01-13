import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  attw: {
    ignoreRules: [
      'false-export-default',
      'untyped-resolution',
    ],
  },
})
