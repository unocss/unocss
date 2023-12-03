import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/dirs',
    'src/index',
    'src/worker',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    dts: {
      respectExternal: true,
    },
  },
  externals: [
    '@typescript-eslint/utils/ts-eslint',
    '@typescript-eslint/utils',
    '@typescript-eslint/types',
  ],
})
