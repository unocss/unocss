import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@unocss/core',
    '@unocss/config',
    '@unocss/preset-uno',
    '@unocss/reset',
    'svelte',
    'vite',
  ],
  rollup: {
    emitCJS: true,
  },
})
