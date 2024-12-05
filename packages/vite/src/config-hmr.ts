import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'

export function ConfigHMRPlugin(ctx: UnocssPluginContext): Plugin | undefined {
  const { ready } = ctx
  return {
    name: 'unocss:config',
    async configResolved(config) {
      await ctx.updateRoot(config.root)
    },
    async configureServer(server) {
      const { sources } = await ready

      ctx.uno.config.envMode = 'dev'
      if (!sources.length)
        return

      server.watcher.add(sources)
      server.watcher.on('change', async (p) => {
        if (!sources.includes(p))
          return

        await ctx.reloadConfig()

        server.ws.send({
          type: 'custom',
          event: 'unocss:config-changed',
        })
      })
    },
  }
}
