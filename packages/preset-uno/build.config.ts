import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/theme',
    'src/utils',
    'src/colors',
  ],
  clean: true,
  declaration: true,
  externals: [
    'unocss',
  ],
  rollup: {
    emitCJS: true,
  },
})
