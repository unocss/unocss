import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/preprocess',
    'src/vite',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@unocss/core',
    '@unocss/config',
    '@unocss/preset-uno',
    '@unocss/reset',
    'css-tree',
    'svelte',
    'vite',
  ],
  rollup: {
    emitCJS: true,
  },
  replace: {
    'import.meta.vitest': 'undefined',
  },
})
