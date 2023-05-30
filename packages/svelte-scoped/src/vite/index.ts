import type { Plugin } from 'vite'
import { type UserConfig, createGenerator } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import type { SvelteScopedContext } from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'
import { PassPreprocessToSveltePlugin } from './passPreprocessToSveltePlugin'
import { GlobalStylesPlugin } from './globalStylesPlugin'
import { createTransformerPlugins } from './transformers'

export default function UnocssSvelteScopedVite(options: UnocssSvelteScopedViteOptions = {}): Plugin[] {
  const context = createSvelteScopedContext(options.configOrPath)

  const plugins: Plugin[] = [
    ...createTransformerPlugins(context, options.cssFileTransformers),
    GlobalStylesPlugin(context, options.injectReset),
  ]

  if (!options.onlyGlobal)
    plugins.push(PassPreprocessToSveltePlugin(options, context))

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
    affectedModules: new Set(),
    uno,
    ready,
  }
}
