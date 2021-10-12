import { loadConfig } from '@unocss/config'
import { Plugin } from 'vite'
import { Context } from './context'

export function ConfigHMRPlugin({ uno, configFilepath: filepath, invalidate, tokens, modules }: Context): Plugin | undefined {
  if (!filepath)
    return

  return {
    name: 'unocss:config',
    configureServer(server) {
      server.watcher.add(filepath)
      server.watcher.on('change', async(p) => {
        if (p !== filepath)
          return
        uno.setConfig(loadConfig(filepath).config)
        tokens.clear()
        await Promise.all(modules.map((code, id) => uno.applyExtractors(code, id, tokens)))
        invalidate()
      })
    },
  }
}
