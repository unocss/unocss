import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'svelte',
  ],
  rollup: {
    dts: {
      respectExternal: true,
    },
    inlineDependencies: true,
    emitCJS: true,
  },
})
