import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/dirs',
    'src/index',
    'src/worker-sort',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
