import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'vite',
    '@unocss/vite',
    '@unocss/core',
  ],
  rollup: {
    inlineDependencies: true,
  },
  alias: aliasVirtual,
})
