import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'svelte',
    '@unocss/core',
    '@unocss/config',
    '@unocss/preset-uno',
    '@unocss/transformer-directives',
  ],
  rollup: {
    inlineDependencies: true, // remove for real thing as it's unneeded
    emitCJS: true,
  },
})
