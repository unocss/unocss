import process from 'node:process'
import type { Plugin } from 'vite'
import { createGenerator } from '@unocss/core'
import type { UserConfig, UserConfigDefaults } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import presetUno from '@unocss/preset-uno'
import type { SvelteScopedContext } from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'
import { PassPreprocessToSveltePlugin } from './passPreprocessToSveltePlugin'
import { GlobalStylesPlugin } from './globalStylesPlugin'
import { createCssTransformerPlugins } from './createCssTransformerPlugins'
import { ConfigHMRPlugin } from './config-hmr'

export function UnocssSvelteScopedVite(options: UnocssSvelteScopedViteOptions = {}): Plugin[] {
  const context = createSvelteScopedContext(options.configOrPath)

  if (context.uno.config.transformers)
    throw new Error('Due to the differences in normal UnoCSS global usage and Svelte Scoped usage, "config.transformers" will be ignored. You can still use transformers in CSS files with the "cssFileTransformers" option.')

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
  const uno = createGenerator()
  const ready = reloadConfig()

  async function reloadConfig() {
    const { config, sources } = await loadConfig(process.cwd(), configOrPath)
    uno.setConfig(config, defaults)
    return { config, sources }
  }

  return {
    uno,
    ready,
  }
}
