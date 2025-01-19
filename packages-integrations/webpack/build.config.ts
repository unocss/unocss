import { defineBuildConfig } from 'unbuild'
import { aliasVirtual } from '../../alias'
import { fixCJSExportTypePlugin } from '../../scripts/cjs-plugin'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/rspack',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  hooks: {
    'rollup:dts:options': (ctx, options) => {
      options.plugins.push(fixCJSExportTypePlugin(ctx))
    },
  },
  externals: [
    'vite',
    'webpack',
  ],
  alias: aliasVirtual,
})
