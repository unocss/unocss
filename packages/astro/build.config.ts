import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    'astro',
    'ofetch',
    'destr',
    'ufo',
    '@unocss/preset-web-fonts/local-font',
  ],
})
