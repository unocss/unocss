import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  externals: [
    '@iconify/types',
    '@iconify/utils/lib/loader/fs',
    '@iconify/utils/lib/loader/install-pkg',
    '@iconify/utils/lib/loader/node-loader',
    '@iconify/utils/lib/loader/node-loaders',
  ],
  rollup: {
    emitCJS: true,
  },
})
