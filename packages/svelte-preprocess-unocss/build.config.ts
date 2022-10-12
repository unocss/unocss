import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@unocss/config',
    '@unocss/core',
    '@unocss/preset-uno',
    '@unocss/vite',
    '@rollup/pluginutils',
    'jiti',
    'magic-string',
    'svelte',
    'unconfig',
  ],
  rollup: {
    emitCJS: true,
  },
})
