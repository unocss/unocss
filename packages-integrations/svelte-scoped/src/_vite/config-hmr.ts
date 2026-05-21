import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'

export function ConfigHMRPlugin({ ready }: UnocssPluginContext): Plugin {
  return {
    name: 'unocss:svelte-scoped:config',
    async configureServer(server) {
      const { sources } = await ready

      if (!sources.length)
        return

      server.watcher.add(sources)
      server.watcher.on('add', handleFileChange)
      server.watcher.on('change', handleFileChange)
      server.watcher.on('unlink', handleFileChange)

      function handleFileChange(filepath: string) {
        if (sources.includes(filepath))
          server.restart()
      }
    },
  }
}
