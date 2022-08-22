const UnoCSS = require('@unocss/webpack').default
const { transformerVariantGroup } = require('unocss')

module.exports = {
  configureWebpack: {
    plugins: [
      UnoCSS({
        transformers: [
          transformerVariantGroup(),
        ],
      }),
    ],
  },
  chainWebpack(config) {
    config.module.rule('vue').uses.delete('cache-loader')
    config.module.rule('tsx').uses.delete('cache-loader')
    config.merge({
      cache: false,
    })
  },
}
