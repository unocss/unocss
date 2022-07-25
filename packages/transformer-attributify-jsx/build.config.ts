import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'magic-string',
  ],
  rollup: {
    emitCJS: true,
  },
})
