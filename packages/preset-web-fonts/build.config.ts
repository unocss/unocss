import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/local-font',
    'src/remote-font',
  ],
  clean: true,
  declaration: true,
})
