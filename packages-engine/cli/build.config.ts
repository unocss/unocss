import { defineBuildConfig } from 'unbuild'
import { alias } from '../../alias'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/cli',
  ],
  clean: true,
  declaration: true,
  rollup: {
    inlineDependencies: true,
  },
  alias,
})
