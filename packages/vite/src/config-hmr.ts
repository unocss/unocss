import { Plugin } from 'vite'
import { UnocssPluginContext } from '../../plugins-common/context'

export function ConfigHMRPlugin(ctx: UnocssPluginContext): Plugin | undefined {
  const { uno, configFilepath, reloadConfig } = ctx
  return {
    name: 'unocss:config',
    api: {
      get config() {
        if (!configFilepath)
          return ctx.config
      },
    },
    configureServer(server) {
      uno.config.envMode = 'dev'

      if (!configFilepath)
        return

      server.watcher.add(configFilepath)
      server.watcher.on('change', async(p) => {
        if (p !== configFilepath)
          return

        reloadConfig()

        server.ws.send({
          type: 'custom',
          event: 'unocss:config-changed',
        })
      })
    },
  }
}
