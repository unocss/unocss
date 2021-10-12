import type { Plugin, ViteDevServer } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, defaultInclude } from './utils'
import { Context } from './context'

const VIRTUAL_ENTRY = '/@unocss/entry.css'

export function GlobalModeDevPlugin({ config, uno, tokens, onInvalidate, scan }: Context): Plugin {
  let server: ViteDevServer | undefined

  const filter = createFilter(
    config.include || defaultInclude,
    config.exclude || defaultExclude,
  )

  let init = false
  const tasks: Promise<any>[] = []
  let timer: any

  onInvalidate(() => {
    if (!server)
      return
    const mod = server.moduleGraph.getModuleById(VIRTUAL_ENTRY)
    if (!mod)
      return

    clearTimeout(timer)
    timer = setTimeout(() => {
      server!.moduleGraph.invalidateModule(mod)
      server!.ws.send({
        type: 'update',
        updates: [{
          acceptedPath: VIRTUAL_ENTRY,
          path: VIRTUAL_ENTRY,
          timestamp: +Date.now(),
          type: 'js-update',
        }],
      })
    }, 10)
  })

  return {
    name: 'unocss:global',
    apply: 'serve',
    enforce: 'pre',
    configureServer(_server) {
      server = _server
    },
    transform(code, id) {
      if (!filter(id))
        return

      scan(code, id)
      return null
    },
    resolveId(id) {
      return id === VIRTUAL_ENTRY ? id : null
    },
    async load(id) {
      if (id !== VIRTUAL_ENTRY)
        return null

      if (!init) {
        await new Promise(resolve => setTimeout(resolve, 400))
        init = true
      }

      await Promise.all(tasks)
      const { css } = await uno.generate(tokens)
      return `/* unocss */\n${css}`
    },
    transformIndexHtml: {
      enforce: 'pre',
      async transform(code, { path }) {
        tasks.push(scan(code, path))
        return `${code}<script src="${VIRTUAL_ENTRY}" type="module"></script>`
      },
    },
  }
}
