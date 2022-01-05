import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/vite',
    'src/preset-uno',
    'src/preset-icons',
    'src/preset-attributify',
    'src/preset-web-fonts',
  ],
  clean: true,
  declaration: true,
  externals: [
    'vite',
  ],
  rollup: {
    emitCJS: true,
  },
})
