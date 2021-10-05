import { Plugin } from 'vite'
import { createGenerator, UserConfigDefaults } from 'unocss'
import { ChunkModeBuildPlugin } from './chunk-build'
import { GlobalModeDevPlugin } from './global-dev'
import { PerModuleModePlugin } from './per-module'
import { UnocssUserOptions } from './types'
import { VueScopedPlugin } from './vue-scoped'

export * from './types'
export * from './chunk-build'
export * from './global-dev'
export * from './per-module'
export * from './vue-scoped'

export default function UnocssPlugin(options: UnocssUserOptions = {}, defaults?: UserConfigDefaults): Plugin[] {
  const mode = options.mode ?? 'global'
  const uno = createGenerator(options, defaults)

  if (mode === 'per-module') {
    return [PerModuleModePlugin(uno, options)]
  }

  else if (mode === 'vue-scoped') {
    return [VueScopedPlugin(uno, options)]
  }

  else if (mode === 'global') {
    return [
      ChunkModeBuildPlugin(uno, options),
      GlobalModeDevPlugin(uno, options),
    ]
  }

  else {
    throw new Error(`[unocss] unknown mode "${mode}"`)
  }
}
