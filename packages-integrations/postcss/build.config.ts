import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'

export default defineBuildConfig([
  {
    entries: [
      'src/esm',
    ],
    clean: true,
    declaration: true,
    failOnWarn: false,
    alias: aliasVirtual,
  },
  {
    entries: [
      'src/index',
    ],
    declaration: true,
    rollup: {
      emitCJS: true,
      preserveDynamicImports: true,
      inlineDependencies: false,
    },
    externals: [
      /postcss\/esm/,
    ],
    alias: aliasVirtual,
  },
])
