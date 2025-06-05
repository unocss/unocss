import type { NuxtPlugin } from '@nuxt/schema'
import type { UserConfig } from '@unocss/core'
import type { VitePluginConfig } from '@unocss/vite'
import type { UnocssNuxtOptions } from './types'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { addComponentsDir, addPluginTemplate, addTemplate, defineNuxtModule, extendViteConfig, extendWebpackConfig, findPath, isNuxt2, isNuxt3 } from '@nuxt/kit'
import { createRecoveryConfigLoader } from '@unocss/config'
import { resolveOptions } from './options'

export { UnocssNuxtOptions }

const dir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtModule<UnocssNuxtOptions>({
  meta: {
    name: 'unocss',
    configKey: 'unocss',
  },
  defaults: {
    mode: 'global',
    autoImport: true,
    preflight: false,
    components: true,
    disableNuxtInlineStyle: true,
    nuxtLayers: false,

    // presets
    uno: true,
    attributify: false,
    webFonts: false,
    icons: false,
    wind: false,
  },
  async setup(options, nuxt) {
    // preset shortcuts
    resolveOptions(options)

    const loadConfig = createRecoveryConfigLoader<UserConfig>()

    options.mode ??= 'global'
    const InjectModes: VitePluginConfig['mode'][] = ['global', 'dist-chunk']

    if (options.disableNuxtInlineStyle) {
      nuxt.options.features ||= {} as any
      nuxt.options.features.inlineStyles = false
    }

    if (options.injectPosition != null)
      console.warn('[unocss/nuxt] options `injectPosition` is temporary removed due to the incompatibility with Nuxt 3.9. We are seeking for better solution. It\'s not effective at this moment.')

    if (options.autoImport) {
      addPluginTemplate({
        filename: 'unocss.mjs',
        getContents: () => {
          const lines = [
            InjectModes.includes(options.mode) ? 'import \'uno.css\'' : '',
            isNuxt2()
              ? 'export default () => {}'
              : 'import { defineNuxtPlugin } from \'#imports\'; export default defineNuxtPlugin(() => {})',
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

    if (options.nuxtLayers) {
      addTemplate({
        filename: 'uno.config.mjs',
        async getContents() {
          const configPaths = (await Promise.all(nuxt.options._layers.slice(1).map(layer =>
            findPath(options.configFile || ['uno.config', 'unocss.config'], { cwd: layer.config.rootDir }),
          )))
            .filter(Boolean)
            .reverse() as string[]

          return (
            `import { mergeConfigs } from '@unocss/core'
${configPaths.map((path, index) => `import cfg${index} from '${path}'`.trimStart()).join('\n').trimEnd()}

export default mergeConfigs([${configPaths.map((_, index) => `cfg${index}`).join(', ')}])
`)
        },
        write: true,
      })
    }

    nuxt.hook('build:before', async () => {
      const { config: unoConfig } = await loadConfig(
        process.cwd(),
        { configFile: options.configFile },
        [],
        options,
      )

      // Override cssnano config
      if (
        isNuxt3()
        && nuxt.options.builder === '@nuxt/vite-builder'
        && nuxt.options.postcss.plugins.cssnano
        && unoConfig.transformers?.some(t => t.name === '@unocss/transformer-directives' && t.enforce !== 'pre')
      ) {
        const preset = nuxt.options.postcss.plugins.cssnano.preset
        nuxt.options.postcss.plugins.cssnano = {
          preset: [preset?.[0] || 'default', Object.assign(
            // Following optimizations result in invalid CSS if the directives not transformed yet
            { mergeRules: false, normalizeWhitespace: false, discardComments: false },
            preset?.[1],
          )],
        }
      }

      await nuxt.callHook('unocss:config', unoConfig)

      extendViteConfig(async (config) => {
        const { default: VitePlugin } = await import('@unocss/vite')
        config.plugins = config.plugins || []
        config.plugins.unshift(...VitePlugin({
          mode: options.mode,
        }, unoConfig))
      })

      extendWebpackConfig(async (config) => {
        const { default: WebpackPlugin } = await import('@unocss/webpack')
        config.plugins = config.plugins || []
        config.plugins.unshift(WebpackPlugin({}, unoConfig))
      })
    })

    if (nuxt.options.dev) {
      // @ts-expect-error missing type
      nuxt.hook('devtools:customTabs', (tabs) => {
        tabs.push({
          title: 'UnoCSS',
          name: 'unocss',
          icon: '/__unocss/favicon.svg',
          view: {
            type: 'iframe',
            src: '/__unocss/',
          },
        })
      })
    }

    // TODO: remove Nuxt 2 support in next major
    // Nuxt 2
    if (isNuxt2()) {
      nuxt.hook('app:resolve', (config) => {
        const plugin: NuxtPlugin = { src: 'unocss.mjs', mode: 'client' }
        if (config.plugins)
          config.plugins.push(plugin)
        else
          config.plugins = [plugin]
      })
    }
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
