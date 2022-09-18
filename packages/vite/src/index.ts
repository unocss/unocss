import type { Plugin } from 'vite'
import type { UnocssPluginContext, UserConfigDefaults } from '@unocss/core'
import UnocssInspector from '@unocss/inspector'
import { createContext } from './integration'
import { ChunkModeBuildPlugin } from './modes/chunk-build'
import { GlobalModeDevPlugin, GlobalModePlugin } from './modes/global'
import { PerModuleModePlugin } from './modes/per-module'
import { VueScopedPlugin } from './modes/vue-scoped'
import { SvelteScopedPlugin } from './modes/svelte-scoped'
import { ShadowDomModuleModePlugin } from './modes/shadow-dom'
import { ConfigHMRPlugin } from './config-hmr'
import type { VitePluginConfig } from './types'
import { createTransformerPlugins } from './transformers'
import { createDevtoolsPlugin } from './devtool'

export * from './types'
export * from './modes/chunk-build'
export * from './modes/global'
export * from './modes/per-module'
export * from './modes/vue-scoped'
export * from './modes/svelte-scoped'

export function defineConfig<Theme extends {}>(config: VitePluginConfig<Theme>) {
  return config
}

export default function UnocssPlugin<Theme extends {}>(
  configOrPath?: VitePluginConfig<Theme> | string,
  defaults: UserConfigDefaults = {},
): Plugin[] {
  const ctx = createContext<VitePluginConfig>(configOrPath as any, defaults)
  const inlineConfig = (configOrPath && typeof configOrPath !== 'string') ? configOrPath : {}
  const mode = inlineConfig.mode ?? 'global'

  const plugins = [
    ConfigHMRPlugin(ctx),
    ...createTransformerPlugins(ctx),
    ...createDevtoolsPlugin(ctx),
    ...createExtraPlugins(ctx),
  ]

  function createExtraPlugins(ctx: UnocssPluginContext) {
    const extraPlugins: Plugin[] = []
    if (inlineConfig.inspector !== false)
      extraPlugins.push(UnocssInspector(ctx))

    switch (mode) {
      case 'per-module':
        extraPlugins.push(...PerModuleModePlugin(ctx))
        break
      case 'vue-scoped':
        extraPlugins.push(VueScopedPlugin(ctx))
        break
      case 'svelte-scoped':
        extraPlugins.push(SvelteScopedPlugin(ctx))
        break
      case 'shadow-dom':
        extraPlugins.push(ShadowDomModuleModePlugin(ctx))
        break
      case 'global':
        extraPlugins.push(...GlobalModePlugin(ctx))
        break
      case 'dist-chunk':
        extraPlugins.push(
          ChunkModeBuildPlugin(ctx),
          ...GlobalModeDevPlugin(ctx),
        )
        break
      default :
        throw new Error(`[unocss] unknown mode "${mode}"`)
    }
    return extraPlugins
  }

  return plugins.filter(Boolean) as Plugin[]
}
