import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'unconfig',
    'magic-string-extra',
  ],
  rollup: {
    emitCJS: true,
  },
})
