import type { Plugin } from 'vite'
import type { SvelteScopedContext } from '../preprocess'

export function ConfigHMRPlugin({ ready }: SvelteScopedContext): Plugin {
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
