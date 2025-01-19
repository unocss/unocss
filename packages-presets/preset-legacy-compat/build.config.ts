import { defineBuildConfig } from 'unbuild'
import { fixCJSExportTypePlugin } from '../../scripts/cjs-plugin'

export default defineBuildConfig({
  entries: [
    'src/index',
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
})
