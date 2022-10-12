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
    emitCJS: true,
  },
})
