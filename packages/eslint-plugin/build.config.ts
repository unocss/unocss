import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig([
  {
    entries: [
      'src/worker',
    ],
    clean: true,
    failOnWarn: false,
  },
  {
    entries: [
      'src/dirs',
      'src/index',
    ],
    clean: false,
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
  },
])
