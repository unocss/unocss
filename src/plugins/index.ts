import { Plugin } from 'vite'
import { createGenerator } from '../generator'
import { resolveConfig } from '../options'
import { GlobalScopeBuildPlugin } from './global-build'
import { GlobalScopeDevPlugin } from './global-dev'
import { ModuleScopePlugin } from './module'
import { MiniwindUserOptions, ResolvedPluginContext } from './types'
import { VueScopedPlugin } from './vue'

export * from './types'
export * from './global-build'
export * from './global-dev'
export * from './module'
export * from './vue'

export default function MiniwindPlugin(options: MiniwindUserOptions = {}): Plugin[] {
  const scope = options.scope ?? 'global'
  const config = resolveConfig(options)
  const generate = createGenerator(config)

  const context: ResolvedPluginContext = {
    config,
    generate,
    options,
  }

  if (scope === 'module') {
    return [ModuleScopePlugin(context)]
  }

  else if (scope === 'vue-scoped') {
    return [VueScopedPlugin(context)]
  }

  else if (scope === 'global') {
    return [
      GlobalScopeBuildPlugin(context),
      GlobalScopeDevPlugin(context),
    ]
  }

  else {
    throw new Error('never reach')
  }
}
