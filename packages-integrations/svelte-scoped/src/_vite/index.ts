import type { Plugin } from 'vite'
import type { UnocssSvelteScopedViteOptions } from './types'
import presetUno from '@unocss/preset-uno'
import { createContext } from '#integration/context'
import { ConfigHMRPlugin } from './config-hmr'
import { createCssTransformerPlugins } from './createCssTransformerPlugins'
import {
  GlobalStylesBuildPlugin,
  GlobalStylesDevPlugin,
  GlobalStylesWarnOutdatedPlugin,
} from './globalStylesPlugin'
import { transformPlugin } from './transform'

export function UnocssSvelteScopedVite(options: UnocssSvelteScopedViteOptions = {}): Plugin[] {
  const context = createContext(options.configOrPath, {
    presets: [
      presetUno(),
    ],
  }, undefined, (result) => {
    if (result.config.transformers?.length)
      throw new Error('Due to the differences in normal UnoCSS global usage and Svelte Scoped usage, "config.transformers" will be ignored. You can still use transformers in CSS files with the "cssFileTransformers" option.')
  })

  if (!options.classPrefix)
    options.classPrefix = 'uno-'

  const plugins: Plugin[] = [
    ...GlobalStylesDevPlugin(context, options.injectReset),
    GlobalStylesBuildPlugin(context, options.injectReset),
    GlobalStylesWarnOutdatedPlugin(),
    ConfigHMRPlugin(context),
  ]

  if (!options.onlyGlobal)
    plugins.push(transformPlugin(context, options))

  if (options.cssFileTransformers)
    plugins.push(...createCssTransformerPlugins(context, options.cssFileTransformers))

  return plugins
}
