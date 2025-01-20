import type { UnoGenerator, UserConfig, UserConfigDefaults } from '@unocss/core'
import type { Plugin } from 'vite'
import type { SvelteScopedContext } from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'
import process from 'node:process'
import { createRecoveryConfigLoader } from '@unocss/config'
import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { ConfigHMRPlugin } from './config-hmr'
import { createCssTransformerPlugins } from './createCssTransformerPlugins'
import { GlobalStylesPlugin } from './globalStylesPlugin'
import { PassPreprocessToSveltePlugin } from './passPreprocessToSveltePlugin'

export function UnocssSvelteScopedVite(options: UnocssSvelteScopedViteOptions = {}): Plugin[] {
  const context = createSvelteScopedContext(options.configOrPath)

  if (!options.classPrefix)
    options.classPrefix = 'uno-'

  const plugins: Plugin[] = [
    GlobalStylesPlugin(context, options.injectReset),
    ConfigHMRPlugin(context),
  ]

  if (!options.onlyGlobal)
    plugins.push(PassPreprocessToSveltePlugin(context, options))

  if (options.cssFileTransformers)
    plugins.push(...createCssTransformerPlugins(context, options.cssFileTransformers))

  return plugins
}

const defaults: UserConfigDefaults = {
  presets: [
    presetUno(),
  ],
}

function createSvelteScopedContext(configOrPath?: UserConfig | string): SvelteScopedContext {
  let uno: UnoGenerator
  const _uno = createGenerator()
    .then((r) => {
      uno = r
      if (uno.config.transformers?.length)
        throw new Error('Due to the differences in normal UnoCSS global usage and Svelte Scoped usage, "config.transformers" will be ignored. You can still use transformers in CSS files with the "cssFileTransformers" option.')
      return r
    })
  const loadConfig = createRecoveryConfigLoader()
  const ready = reloadConfig()

  async function reloadConfig() {
    await _uno
    const { config, sources } = await loadConfig(process.cwd(), configOrPath)
    await uno.setConfig(config, defaults)
    return { config, sources }
  }

  return {
    get uno() {
      if (!uno)
        throw new Error('Run `await ctx.ready` before accessing to `ctx.uno`')
      return uno
    },
    ready,
  }
}
