import { isWindows } from 'std-env'
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
  external: [
    '@unocss/core',
    '@unocss/rule-utils',
    '@unocss/extractor-arbitrary-variants',
  ],
  failOnWarn: !isWindows,
  attw: {
    profile: 'esm-only',
  },
})
