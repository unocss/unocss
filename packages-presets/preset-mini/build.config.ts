import { isWindows } from 'std-env'
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
    dts: {
      respectExternal: false,
    },
  },
  failOnWarn: !isWindows,
})
