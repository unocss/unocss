import { defineNuxtModule, extendViteConfig, extendWebpackConfig, addPluginTemplate } from '@nuxt/kit'
import Unocss, { UnocssPluginOptions } from 'unocss/vite'

export default defineNuxtModule<UnocssPluginOptions>({
  name: 'unocss',
  defaults: {},
  configKey: 'unocss',
  setup(options, nuxt) {
    nuxt.options.alias['/_nuxt/@unocss-entry.css'] = '/@unocss-entry.css'

    addPluginTemplate({
      filename: 'unocss.mjs',
      src: '',
      getContents: () => 'import \'uno.css\';export default () => {};',
    })

    extendViteConfig((config) => {
      config.plugins = config.plugins || []
      config.plugins.unshift(...Unocss(options))
    })

    extendWebpackConfig(() => {
      throw new Error('UnoCSS does not support Webpack at this moment')
    })
  },
})
