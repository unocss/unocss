import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/flat',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    '@typescript-eslint/utils/ts-eslint',
    '@typescript-eslint/utils',
    '@typescript-eslint/types',
  ],
})
