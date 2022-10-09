import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'unconfig',
    'magic-string',
    '@unocss/core',
    '@unocss/config',
  ],
  rollup: {
    emitCJS: true,
    dts: {
      respectExternal: false,
    },
  },
})
