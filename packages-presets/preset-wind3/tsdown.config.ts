import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/rules.ts',
    'src/shortcuts.ts',
    'src/colors.ts',
    'src/theme.ts',
    'src/utils.ts',
    'src/variants.ts',
  ],
  clean: true,
  dts: true,
  external: [
    'unconfig',
    'magic-string',
    '@unocss/core',
    '@unocss/config',
  ],
})
