import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/variants',
  ],
  clean: true,
  declaration: true,
})
