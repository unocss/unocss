import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig([
  {
    entries: [
      'src/esm',
    ],
    clean: true,
    declaration: true,
    failOnWarn: false,
  },
  {
    entries: [
      'src/index',
    ],
    declaration: true,
    rollup: {
      emitCJS: true,
    },
    externals: [
      '@unocss/postcss/esm',
    ],
  },
])
