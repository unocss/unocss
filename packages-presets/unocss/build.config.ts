import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig([
  {
    name: 'Dual',
    entries: [
      'src/webpack',
      'src/postcss',
    ],
    clean: true,
    declaration: true,
    externals: [
      'webpack',
      '@unocss/webpack',
    ],
    failOnWarn: false,
    rollup: {
      emitCJS: true,
    },
  },
  {
    name: 'ESM only',
    entries: [
      'src/index',
      'src/vite',
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
    clean: false,
    declaration: true,
    externals: [
      'vite',
      'astro',
    ],
  },
])
