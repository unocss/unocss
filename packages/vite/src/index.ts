import { Plugin } from 'vite'
import { createGenerator, resolveConfig } from './init'
import { ChunkModeBuildPlugin } from './chunk-build'
import { GlobalModeDevPlugin } from './global-dev'
import { PerModuleModePlugin } from './per-module'
import { MiniwindUserOptions, ResolvedPluginContext } from './types'
import { VueScopedPlugin } from './vue-scoped'

export * from './types'
export * from './chunk-build'
export * from './global-dev'
export * from './per-module'
export * from './vue-scoped'

export default function MiniwindPlugin(options: MiniwindUserOptions = {}): Plugin[] {
  const mode = options.mode ?? 'global'
  const config = resolveConfig(options)
  const generate = createGenerator(config)

  const context: ResolvedPluginContext = {
    config,
    generate,
    options,
  }

  if (mode === 'per-module') {
    return [PerModuleModePlugin(context)]
  }

  else if (mode === 'vue-scoped') {
    return [VueScopedPlugin(context)]
  }

  else if (mode === 'global') {
    return [
      ChunkModeBuildPlugin(context),
      GlobalModeDevPlugin(context),
    ]
  }

  else {
    throw new Error(`[miniwind] unknown mode "${mode}"`)
  }
}
