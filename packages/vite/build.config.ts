import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/client',
  ],
  clean: true,
  declaration: true,
  externals: [
    'vite',
    'ofetch',
    'destr',
    'ufo',
    '@unocss/preset-web-fonts/local-font',
    '@unocss/preset-web-fonts/remote-font',
  ],
})
