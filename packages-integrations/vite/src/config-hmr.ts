import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { normalizePath, version } from 'vite'

const supportsEnvironmentHmr = Number.parseInt(version) >= 8
const changedConfigSources = new WeakMap<UnocssPluginContext, Set<string>>()

export function isConfigSource(ctx: UnocssPluginContext, file: string) {
  return ctx.getConfigFileList().some(source => normalizePath(source) === file)
    || changedConfigSources.get(ctx)?.has(file)
}

export function consumeConfigSource(ctx: UnocssPluginContext, file: string) {
  return changedConfigSources.get(ctx)?.delete(file) ?? false
}

export function ConfigHMRPlugin(ctx: UnocssPluginContext): Plugin | undefined {
  const { ready } = ctx
  const reload = async (file: string) => {
    if (!isConfigSource(ctx, file))
      return
    let changed = changedConfigSources.get(ctx)
    if (!changed) {
      changed = new Set()
      changedConfigSources.set(ctx, changed)
    }
    changed.add(file)
    await ctx.reloadConfig()
  }
  const plugin: Plugin = {
    name: 'unocss:config',
    enforce: 'pre',
    async configResolved(config) {
      await ctx.updateRoot(config.root)
    },
    async configureServer(server) {
      await ready
      ctx.uno.config.envMode = 'dev'
      server.watcher.add(ctx.getConfigFileList())
      if (!supportsEnvironmentHmr)
        server.watcher.on('unlink', reload)
    },
  }

  if (supportsEnvironmentHmr) {
    plugin.hotUpdate = async function ({ file }) {
      if (this.environment.name === 'client')
        await reload(file)
    }
  }
  else {
    plugin.handleHotUpdate = async ({ file }) => {
      await reload(file)
    }
  }

  return plugin
}
