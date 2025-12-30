import { defineConfig } from 'tsdown'

export default defineConfig({
  attw: { profile: 'esm-only' },
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
    '@unocss/core',
    '@unocss/preset-mini',
    '@unocss/rule-utils',
  ],
})
