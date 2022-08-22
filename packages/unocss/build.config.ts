import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/vite',
    'src/webpack',
    'src/astro',
    'src/preset-uno',
    'src/preset-icons',
    'src/preset-attributify',
    'src/preset-tagify',
    'src/preset-web-fonts',
    'src/preset-typography',
    'src/preset-wind',
    'src/preset-mini',
  ],
  clean: true,
  declaration: true,
  externals: [
    'vite',
    'astro',
    'webpack',
    '@unocss/webpack',
  ],
  rollup: {
    emitCJS: true,
  },
})
