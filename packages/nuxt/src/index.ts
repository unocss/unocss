import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, extendViteConfig, extendWebpackConfig, addPluginTemplate, addComponentsDir } from '@nuxt/kit'
import { UserConfig } from '@unocss/core'

const dir = dirname(fileURLToPath(import.meta.url))

export interface UnocssNuxtOptions extends UserConfig {
  /**
   * Injecting `uno.css` entry automatically
   *
   * @default true
   */
  autoImport?: boolean
}

export default defineNuxtModule<UnocssNuxtOptions>({
  name: 'unocss',
  defaults: {
    autoImport: true,
  },
  configKey: 'unocss',
  setup(options) {
    addPluginTemplate({
      filename: 'unocss.mjs',
      src: '',
      getContents: () => 'import \'uno.css\';export default () => {};',
    })

    addComponentsDir({
      path: resolve(dir, '../runtime'),
      watch: false,
    })

    extendViteConfig(async(config) => {
      const { default: Plugin } = await import('@unocss/vite')
      config.plugins = config.plugins || []
      config.plugins.unshift(...Plugin(options))
    })

    extendWebpackConfig(async(config) => {
      const { default: Plugin } = await import('@unocss/webpack')
      config.plugins = config.plugins || []
      config.plugins.push(Plugin(options))
    })
  },
})
