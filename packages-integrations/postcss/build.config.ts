import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'
import { fixCJSExportTypePlugin } from '../../scripts/cjs-plugin'

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
    hooks: {
      'rollup:dts:options': (ctx, options) => {
        options.plugins.push(fixCJSExportTypePlugin(ctx))
      },
    },
    externals: [
      /postcss\/esm/,
    ],
    alias: aliasVirtual,
  },
])
