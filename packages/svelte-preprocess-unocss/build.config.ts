import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'svelte',
    '@unocss/config',
    '@unocss/core',
    '@unocss/preset-uno',
  ],
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
  },
})
