import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { normalizePath } from 'vite'

const changedConfigSources = new WeakMap<UnocssPluginContext, Set<string>>()

export function isConfigSource(ctx: UnocssPluginContext, file: string) {
  const normalizedFile = normalizePath(file)
  return (
    ctx.getConfigFileList().some(source => normalizePath(source) === normalizedFile)
    || changedConfigSources.get(ctx)?.has(normalizedFile)
  )
}

export function consumeConfigSource(ctx: UnocssPluginContext, file: string) {
  return changedConfigSources.get(ctx)?.delete(normalizePath(file)) ?? false
}

export function ConfigHMRPlugin(ctx: UnocssPluginContext): Plugin {
  const { ready } = ctx
  const reload = async (file: string) => {
    if (!isConfigSource(ctx, file))
      return
    let changed = changedConfigSources.get(ctx)
    if (!changed) {
      changed = new Set()
      changedConfigSources.set(ctx, changed)
    }
    changed.add(normalizePath(file))
    await ctx.reloadConfig()
  }
  return {
    name: 'unocss:config',
    enforce: 'pre',
    async configResolved(config) {
      await ctx.updateRoot(config.root)
    },
    async configureServer(server) {
      await ready
      ctx.uno.config.envMode = 'dev'
      server.watcher.add(ctx.getConfigFileList())
    },
    async hotUpdate({ file }) {
      if (this.environment.name === 'client')
        await reload(file)
    },
  }
}
