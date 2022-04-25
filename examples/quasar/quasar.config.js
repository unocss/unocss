// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js
const UnoCSS = require('unocss/vite').default
const { presetAttributify, presetUno } = require('unocss')
const { configure } = require('quasar/wrappers')

module.exports = configure(() => {
  return {
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16',
      },
      vueRouterMode: 'hash',
      extendViteConf(config) {
        config.plugins.push(
          ...UnoCSS({
            presets: [
              presetUno(),
              presetAttributify(),
            ],
          }),
        )
      },
    },
    devServer: {
      open: true,
    },
  }
})
