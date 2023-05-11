import type { Plugin } from 'vite'
import { type UserConfig, createGenerator } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import type { SvelteScopedContext } from '@unocss/svelte-preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'
import { PassPreprocessToSveltePlugin } from './passPreprocessToSveltePlugin'
import { GlobalStylesPlugin } from './globalStylesPlugin'

export default function SvelteScopedUno(options: UnocssSvelteScopedViteOptions = {}): Plugin[] {
  const context = createSvelteScopedContext(options.configOrPath)

  const plugins: Plugin[] = [
    GlobalStylesPlugin(context, options.addReset),
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
    uno,
    ready,
  }
}
