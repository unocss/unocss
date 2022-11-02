import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { addComponentsDir, defineNuxtModule, extendWebpackConfig } from '@nuxt/kit'
import WebpackPlugin from '@unocss/webpack'
import VitePlugin from '@unocss/vite'
import type { NuxtPlugin } from '@nuxt/schema'
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
      nuxt.options.css ||= []
      nuxt.options.css.push('uno.css')

      if (options.preflight)
        nuxt.options.css.unshift('@unocss/reset/tailwind.css')
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

    nuxt.hook('config', (config) => {
      const plugin: NuxtPlugin = { src: 'unocss.mjs', mode: 'client' }
      if (config.plugins)
        config.plugins.push(plugin)
      else
        config.plugins = [plugin]
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
