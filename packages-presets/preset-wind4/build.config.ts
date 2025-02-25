import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/rules',
    'src/shortcuts',
    'src/colors',
    'src/theme',
    'src/utils',
    'src/variants',
    'src/postprocess',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@unocss/core',
  ],
  rollup: {
    dts: {
      respectExternal: false,
    },
  },
})
