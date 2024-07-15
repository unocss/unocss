import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/local',
  ],
  clean: true,
  declaration: true,
})
