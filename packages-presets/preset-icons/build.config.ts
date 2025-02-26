import { defineBuildConfig } from 'unbuild'

const externals = [
  'ms',
  'jiti',
  'unconfig',
  '@unocss/config',
  '@unocss/core',
  'magic-string',
]

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/browser',
    'src/core',
  ],
  clean: true,
  declaration: true,
  externals,
  rollup: {
    inlineDependencies: true,
    dts: {
      respectExternal: false,
    },
  },
  hooks: {
    'rollup:options': function (ctx, options) {
      const external = options.external as any
      const inlines = [
        'debug',
        '@stub',
        '@iconify/utils',
        '@iconify/utils/lib/loader/loader',
        '@iconify/utils/lib/loader/modern',
        '@iconify/utils/lib/svg/encode-svg-for-css',
      ]
      options.external = (id) => {
        if (inlines.includes(id))
          return false
        return external(id)
      }
      if (Array.isArray(options.plugins)) {
        options.plugins.unshift({
          name: 'stub',
          resolveId(id) {
            if (id === 'debug')
              return '@stub'
          },
          load(id) {
            if (id === '@stub')
              return 'export default function () {return ()=>{}}'
          },
        })
      }
    },
  },
})
