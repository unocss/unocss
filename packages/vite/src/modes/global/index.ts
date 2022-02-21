import type { UnocssPluginContext } from '@unocss/core'
import { GlobalModeBuildPlugin } from './build'
import { GlobalModeDevPlugin } from './dev'

export * from './dev'
export * from './build'

export function GlobalModePlugin(ctx: UnocssPluginContext) {
  return [
    ...GlobalModeBuildPlugin(ctx),
    ...GlobalModeDevPlugin(ctx),
  ]
}
