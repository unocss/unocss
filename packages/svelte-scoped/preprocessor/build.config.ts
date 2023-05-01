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
    '@unocss/preset-uno',
    // '@unocss/transformer-directives',
  ],
  rollup: {
    emitCJS: true,
  },
})
