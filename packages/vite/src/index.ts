import process from 'node:process'
import type { Plugin } from 'vite'
import type { UnocssPluginContext, UserConfigDefaults } from '@unocss/core'
import UnocssInspector from '@unocss/inspector'
import { createContext } from './integration'
import { ChunkModeBuildPlugin } from './modes/chunk-build'
import { GlobalModeDevPlugin, GlobalModePlugin } from './modes/global'
import { PerModuleModePlugin } from './modes/per-module'
import { VueScopedPlugin } from './modes/vue-scoped'
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

export function defineConfig<Theme extends object>(config: VitePluginConfig<Theme>) {
  return config
}

export interface UnocssVitePluginAPI {
  getContext: () => UnocssPluginContext<VitePluginConfig>
  getMode: () => VitePluginConfig['mode']
}

export default function UnocssPlugin<Theme extends object>(
  configOrPath?: VitePluginConfig<Theme> | string,
  defaults: UserConfigDefaults = {},
): Plugin[] {
  const ctx = createContext<VitePluginConfig>(configOrPath as any, {
    envMode: process.env.NODE_ENV === 'development'
      ? 'dev'
      : 'build',
    ...defaults,
    legacy: typeof configOrPath !== 'string'
      ? (configOrPath?.legacy || { renderModernChunks: true })
      : { renderModernChunks: true },
  })
  const inlineConfig = (configOrPath && typeof configOrPath !== 'string') ? configOrPath : {}
  const mode = inlineConfig.mode ?? 'global'

  const plugins = [
    ConfigHMRPlugin(ctx),
    ...createTransformerPlugins(ctx),
    ...createDevtoolsPlugin(ctx, inlineConfig),
    {
      name: 'unocss:api',
      api: <UnocssVitePluginAPI>{
        getContext: () => ctx,
        getMode: () => mode,
      },
    },
  ]

  if (inlineConfig.inspector !== false)
    plugins.push(UnocssInspector(ctx))

  if (mode === 'per-module') {
    plugins.push(...PerModuleModePlugin(ctx))
  }
  else if (mode === 'vue-scoped') {
    plugins.push(VueScopedPlugin(ctx))
  }
  // @ts-expect-error alerts users who were already using this mode before it became its own package
  else if (mode === 'svelte-scoped') {
    throw new Error('[unocss] svelte-scoped mode is now its own package, please use @unocss/svelte-scoped according to the docs')
  }
  else if (mode === 'shadow-dom') {
    plugins.push(ShadowDomModuleModePlugin(ctx))
  }
  else if (mode === 'global') {
    plugins.push(...GlobalModePlugin(ctx))
  }
  else if (mode === 'dist-chunk') {
    plugins.push(
      ChunkModeBuildPlugin(ctx),
      ...GlobalModeDevPlugin(ctx),
    )
  }
  else {
    throw new Error(`[unocss] unknown mode "${mode}"`)
  }

  return plugins.filter(Boolean) as Plugin[]
}
