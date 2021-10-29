import type { Plugin, ViteDevServer } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, defaultInclude } from '../../utils'
import { Context } from '../../context'
import { READY_CALLBACK, VIRTUAL_ENTRY } from './shared'

export function GlobalModeDevPlugin({ config, uno, tokens, onInvalidate, scan }: Context): Plugin[] {
  let server: ViteDevServer | undefined

  const filter = createFilter(
    config.include || defaultInclude,
    config.exclude || defaultExclude,
  )

  const tasks: Promise<any>[] = []
  let timer: any
  let lastUpdate = +new Date()

  function invalidate() {
    if (!server)
      return
    const mod = server.moduleGraph.getModuleById(VIRTUAL_ENTRY)
    if (!mod)
      return
    lastUpdate = +new Date()
    server!.moduleGraph.invalidateModule(mod)
    clearTimeout(timer)
    timer = setTimeout(sendUpdate, 10)
  }

  function sendUpdate() {
    server!.ws.send({
      type: 'update',
      updates: [{
        acceptedPath: VIRTUAL_ENTRY,
        path: VIRTUAL_ENTRY,
        timestamp: lastUpdate,
        type: 'js-update',
      }],
    })
  }

  onInvalidate(invalidate)

  return [
    {
      name: 'unocss:global',
      apply: 'serve',
      enforce: 'pre',
      configureServer(_server) {
        server = _server
        server.middlewares.use(async(req, res, next) => {
          if (req.url === READY_CALLBACK) {
            sendUpdate()
            res.statusCode = 200
            res.end()
          }
          else {
            return next()
          }
        })
      },
      transform(code, id) {
        if (filter(id))
          scan(code, id)
        return null
      },
      transformIndexHtml: {
        enforce: 'pre',
        transform(code, { path }) {
          scan(code, path)
        },
      },
      resolveId(id) {
        return id === VIRTUAL_ENTRY ? id : null
      },
      async load(id) {
        if (id !== VIRTUAL_ENTRY)
          return null

        await Promise.all(tasks)
        const { css } = await uno.generate(tokens)
        return css
      },
    },
  ]
}
