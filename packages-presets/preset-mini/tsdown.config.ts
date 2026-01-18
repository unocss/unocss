import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/theme.ts',
    'src/utils.ts',
    'src/rules.ts',
    'src/colors.ts',
    'src/variants.ts',
  ],
  clean: true,
  dts: true,
  failOnWarn: true,
  publint: true,
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
  },
})
