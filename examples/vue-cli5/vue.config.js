const process = require('node:process')
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  configureWebpack: {
    devtool: 'inline-source-map',
    plugins: [
      UnoCSS(),
    ],
    optimization: {
      realContentHash: true,
    },
  },
  chainWebpack(config) {
    config.module.rule('vue').uses.delete('cache-loader')
    config.module.rule('tsx').uses.delete('cache-loader')
    config.merge({
      cache: false,
    })
  },
  css: {
    extract: process.env.NODE_ENV === 'development'
      ? {
          filename: 'css/[name].css',
          chunkFilename: 'css/[name].css',
        }
      : true,
  },
}
