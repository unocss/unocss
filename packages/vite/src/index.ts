import { Plugin } from 'vite'
import { createGenerator, presetUno, UserConfigDefaults } from 'unocss'
import { loadConfig } from '@unocss/config'
import { createContext } from './context'
import { ChunkModeBuildPlugin } from './chunk-build'
import { GlobalModeDevPlugin } from './global-dev'
import { PerModuleModePlugin } from './per-module'
import { UnocssUserOptions } from './types'
import { VueScopedPlugin } from './vue-scoped'
import { GlobalModeBuildPlugin } from './global-build'
import { ConfigHMRPlugin } from './config-hmr'

export * from './types'
export * from './chunk-build'
export * from './global-dev'
export * from './per-module'
export * from './vue-scoped'

export default function UnocssPlugin(
  configOrPath?: UnocssUserOptions | string,
  defaults: UserConfigDefaults = {
    presets: [
      presetUno(),
    ],
  },
): Plugin[] {
  const { config = {}, filepath } = loadConfig(configOrPath)

  const mode = config.mode ?? 'global'
  const uno = createGenerator(config, defaults)
  const ctx = createContext(uno, config, filepath)

  const plugins = [
    ConfigHMRPlugin(ctx),
  ]

  if (mode === 'per-module') {
    plugins.push(PerModuleModePlugin(ctx))
  }
  else if (mode === 'vue-scoped') {
    plugins.push(VueScopedPlugin(ctx))
  }
  else if (mode === 'global') {
    plugins.push(
      ...GlobalModeBuildPlugin(ctx),
      GlobalModeDevPlugin(ctx),
    )
  }
  else if (mode === 'dist-chunk') {
    plugins.push(
      ChunkModeBuildPlugin(ctx),
      GlobalModeDevPlugin(ctx),
    )
  }
  else {
    throw new Error(`[unocss] unknown mode "${mode}"`)
  }

  return plugins.filter(Boolean) as Plugin[]
}
