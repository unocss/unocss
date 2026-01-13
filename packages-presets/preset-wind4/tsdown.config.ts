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
  alias: aliasVirtual,
  attw: {
    profile: 'esm-only',
  },
})
