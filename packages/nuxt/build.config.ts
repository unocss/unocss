import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  emitCJS: false,
  clean: true,
  declaration: true,
  externals: [
    '@nuxt/schema',
  ],
})
