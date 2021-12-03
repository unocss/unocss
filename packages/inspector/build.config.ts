import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'node/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'vite',
    '@unocss/vite',
  ],
})
