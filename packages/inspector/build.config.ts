import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'vite',
    '@unocss/vite',
    '@unocss/core',
  ],
  rollup: {
    inlineDependencies: true,
  },
})
