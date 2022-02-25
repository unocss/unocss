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
  rollup: {
    emitCJS: true,
  },
})
