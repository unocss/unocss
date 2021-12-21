import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/fs',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@iconify/types',
  ],
  rollup: {
    emitCJS: true,
  },
})
