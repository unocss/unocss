import { Plugin } from 'vite'
import { createGenerator, UserConfigDefaults } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import UnocssInspector from '@unocss/inspector'
import { createContext } from './context'
import { ChunkModeBuildPlugin } from './modes/chunk-build'
import { GlobalModeDevPlugin, GlobalModePlugin } from './modes/global'
import { PerModuleModePlugin } from './modes/per-module'
import { VueScopedPlugin } from './modes/vue-scoped'
import { ConfigHMRPlugin } from './config-hmr'
import { VitePluginOptions } from './types'

export * from './types'
export * from './modes/chunk-build'
export * from './modes/global'
export * from './modes/per-module'
export * from './modes/vue-scoped'

export { UnocssPluginContext } from './context'

export function defineConfig<Theme extends {}>(config: VitePluginOptions<Theme>) {
  return config
}

export default function UnocssPlugin(
  configOrPath?: VitePluginOptions | string,
  defaults: UserConfigDefaults = {},
): Plugin[] {
  const { config = {}, filepath } = loadConfig(configOrPath)

  const mode = config.mode ?? 'global'
  const uno = createGenerator(config, defaults)
  const ctx = createContext(uno, config, filepath)

  const plugins = [
    ConfigHMRPlugin(ctx),
  ]

  if (config.inspector !== false)
    plugins.push(UnocssInspector(ctx))

  if (mode === 'per-module') {
    plugins.push(PerModuleModePlugin(ctx))
  }
  else if (mode === 'vue-scoped') {
    plugins.push(VueScopedPlugin(ctx))
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
