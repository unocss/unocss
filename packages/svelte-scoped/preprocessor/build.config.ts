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
    'css-tree',
  ],
  rollup: {
    emitCJS: true,
  },
})
