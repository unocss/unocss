import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, extendViteConfig, extendWebpackConfig, addPluginTemplate, addComponentsDir } from '@nuxt/kit'
import Unocss, { UnocssPluginOptions } from 'unocss/vite'

const dir = dirname(fileURLToPath(import.meta.url))

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

    addComponentsDir({
      path: resolve(dir, '../runtime'),
      watch: false,
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
