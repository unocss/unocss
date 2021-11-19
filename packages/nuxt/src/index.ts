import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, extendViteConfig, extendWebpackConfig, addPluginTemplate, addComponentsDir } from '@nuxt/kit'
import presetUno from '@unocss/preset-uno'
import presetAttributify, { AttributifyOptions } from '@unocss/preset-attributify'
import presetIcons, { IconsOptions } from '@unocss/preset-icons'
import WebpackPlugin from '@unocss/webpack'
import VitePlugin from '@unocss/vite'
import { PluginOptions } from '../../plugins-common/types'

const dir = dirname(fileURLToPath(import.meta.url))

export interface UnocssNuxtOptions extends PluginOptions {
  /**
   * Injecting `uno.css` entry
   *
   * @default true
   */
  autoImport?: boolean

  /**
   * Injecting `@unocss/reset/tailwind.css` entry
   *
   * @default false
   */
  preflight?: boolean

  /**
   * Installing UnoCSS components
   * - `<UnoIcon>`
   *
   * @default true
   */
  components?: boolean

  /**
   * Enable the default preset
   * Only works when `presets` is not specified
   * @default true
   */
  uno?: boolean

  /**
   * Enable attributify mode and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  attributify?: boolean | AttributifyOptions

  /**
   * Enable icons preset and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  icons?: boolean | IconsOptions
}

export default defineNuxtModule<UnocssNuxtOptions>({
  name: 'unocss',
  defaults: {
    uno: true,
    attributify: false,
    preflight: false,
    icons: false,
    components: true,
    autoImport: true,
  },
  configKey: 'unocss',
  setup(options) {
    // preset shortcuts
    if (options.presets == null) {
      options.presets = []
      if (options.uno)
        options.presets.push(presetUno())
      if (options.attributify)
        options.presets.push(presetAttributify(typeof options.attributify == 'boolean' ? {} : options.attributify))
      if (options.icons)
        options.presets.push(presetIcons(typeof options.icons == 'boolean' ? {} : options.icons))
    }

    if (options.autoImport) {
      addPluginTemplate({
        filename: 'unocss.mjs',
        src: '',
        getContents: () => {
          const lines = [
            'import \'uno.css\'',
            'export default () => {};',
          ]
          if (options.preflight)
            lines.unshift('import \'@unocss/reset/tailwind.css\'')
          return lines.join('\n')
        },
      })
    }

    if (options.components) {
      addComponentsDir({
        path: resolve(dir, '../runtime'),
        watch: false,
      })
    }

    extendViteConfig((config) => {
      config.plugins = config.plugins || []
      config.plugins.unshift(...VitePlugin(options))
    })

    extendWebpackConfig((config) => {
      config.plugins = config.plugins || []
      config.plugins.unshift(WebpackPlugin(options))
    })
  },
})

declare module '@nuxt/kit' {
  interface ConfigSchema {
    unocss?: UnocssNuxtOptions
  }
}
