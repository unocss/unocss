import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'
import { fixCJSExportTypePlugin } from '../../scripts/cjs-plugin'

export default defineBuildConfig([
  {
    entries: [
      'src/worker',
    ],
    clean: true,
    failOnWarn: false,
    alias: aliasVirtual,
  },
  {
    entries: [
      'src/dirs',
      'src/index',
    ],
    clean: false,
    declaration: true,
    rollup: {
      emitCJS: true,
      dts: {
        respectExternal: true,
      },
    },
    hooks: {
      'rollup:dts:options': (ctx, options) => {
        options.plugins.push(fixCJSExportTypePlugin(ctx))
      },
    },
    externals: [
      '@typescript-eslint/utils/ts-eslint',
      '@typescript-eslint/utils',
      '@typescript-eslint/types',
    ],
    alias: aliasVirtual,
  },
])
