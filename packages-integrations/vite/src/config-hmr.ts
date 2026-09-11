import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { normalizePath } from 'vite'

export function isConfigSource(ctx: UnocssPluginContext, file: string) {
  return ctx.getConfigFileList().some(source => normalizePath(source) === file)
}

export function ConfigHMRPlugin(ctx: UnocssPluginContext): Plugin | undefined {
  const { ready } = ctx
  return {
    name: 'unocss:config',
    async configResolved(config) {
      await ctx.updateRoot(config.root)
    },
    async configureServer(server) {
      await ready
      ctx.uno.config.envMode = 'dev'
      server.watcher.add(ctx.getConfigFileList())
    },
    async hotUpdate({ file, type }) {
      if (type === 'delete' || this.environment.name !== 'client')
        return
      if (!isConfigSource(ctx, file))
        return
      await ctx.reloadConfig()
    },
  }
}
