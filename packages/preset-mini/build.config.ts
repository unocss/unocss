import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/theme',
    'src/utils',
    'src/rules',
    'src/colors',
    'src/variants',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
