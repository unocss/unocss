import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/rules.ts',
    'src/shortcuts.ts',
    'src/colors.ts',
    'src/theme.ts',
    'src/utils.ts',
    'src/variants.ts',
    'src/postprocess.ts',
  ],
  clean: true,
  dts: true,
  external: [
    '@unocss/core',
    '@unocss/rule-utils',
    '@unocss/extractor-arbitrary-variants',
  ],
  alias: aliasVirtual,
  attw: {
    profile: 'esm-only',
  },
})
