import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { addComponentsDir, addPluginTemplate, defineNuxtModule, extendWebpackConfig } from '@nuxt/kit'
import WebpackPlugin from '@unocss/webpack'
import VitePlugin from '@unocss/vite'
import { resolveOptions } from './options'
import type { UnocssNuxtOptions } from './types'

export { UnocssNuxtOptions }

const dir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtModule<UnocssNuxtOptions>({
  meta: {
    name: 'unocss',
    configKey: 'unocss',
  },
  defaults: {
    autoImport: true,
    preflight: false,
    components: true,

    // presets
    uno: true,
    attributify: false,
    webFonts: false,
    icons: false,
    wind: false,
  },
  setup(options, nuxt) {
    // preset shortcuts
    resolveOptions(options)

    if (options.autoImport) {
      addPluginTemplate({
        filename: 'unocss.mjs',
        getContents: () => {
          const lines = [
            'import \'uno.css\'',
            'export default defineNuxtPlugin(() => {})',
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

    nuxt.hook('vite:extend', ({ config }) => {
      config.plugins = config.plugins || []
      config.plugins.unshift(...VitePlugin({}, options))
    })

    extendWebpackConfig((config) => {
      config.plugins = config.plugins || []
      config.plugins.unshift(WebpackPlugin({}, options))
    })
  },
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    unocss?: UnocssNuxtOptions
  }
  interface NuxtOptions {
    unocss?: UnocssNuxtOptions
  }
}
