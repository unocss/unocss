import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'

export function ConfigHMRPlugin(ctx: UnocssPluginContext): Plugin | undefined {
  const { ready, uno } = ctx
  return {
    name: 'unocss:config',
    async configResolved(config) {
      await ctx.updateRoot(config.root)
    },
    async configureServer(server) {
      uno.config.envMode = 'dev'

      const { sources } = await ready

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
