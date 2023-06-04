import type { Plugin } from 'vite'
import { type UserConfig, createGenerator } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import type { SvelteScopedContext } from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'
import { PassPreprocessToSveltePlugin } from './passPreprocessToSveltePlugin'
import { GlobalStylesPlugin } from './globalStylesPlugin'
import { createCssTransformerPlugins } from './createCssTransformerPlugins'

export function UnocssSvelteScopedVite(options: UnocssSvelteScopedViteOptions = {}): Plugin[] {
  const context = createSvelteScopedContext(options.configOrPath)

  if (context.uno.config.transformers)
    throw new Error('Due to the differences in normal UnoCSS global usage and Svelte Scoped usage, "config.transformers" will be ignored. You can still use transformers in CSS files with the "cssFileTransformers" option.')

  const plugins: Plugin[] = [
    GlobalStylesPlugin(context, options.injectReset),
  ]

  if (!options.onlyGlobal)
    plugins.push(PassPreprocessToSveltePlugin(options, context))

  if (options.cssFileTransformers)
    plugins.push(...createCssTransformerPlugins(context, options.cssFileTransformers))

  return plugins
}

function createSvelteScopedContext(configOrPath?: UserConfig | string): SvelteScopedContext {
  const uno = createGenerator()
  const ready = reloadConfig()

  async function reloadConfig() {
    const { config } = await loadConfig(process.cwd(), configOrPath)
    uno.setConfig(config)
    return config
  }

  return {
    uno,
    ready,
  }
}
