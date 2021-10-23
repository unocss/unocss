import type { Plugin, ViteDevServer } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, defaultInclude } from './utils'
import { Context } from './context'

const VIRTUAL_ENTRY = '/@unocss-entry'
const READY_CALLBACK = '/__unocss_ready'

export function GlobalModeDevPlugin({ config, uno, tokens, onInvalidate, scan }: Context): Plugin {
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

  return {
    name: 'unocss:global',
    apply: 'serve',
    enforce: 'pre',
    configureServer(_server) {
      server = _server
      server.middlewares.use(async(req, res, next) => {
        if (req.url === READY_CALLBACK) {
          let body = ''
          await new Promise((resolve) => {
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', resolve)
          })
          if (+body !== lastUpdate)
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

      await Promise.all(tasks)
      const { css } = await uno.generate(tokens)
      return `
import { updateStyle, removeStyle } from "/@vite/client";
const id = "${VIRTUAL_ENTRY}"
import.meta.hot.accept()
import.meta.hot.prune(() => removeStyle(id))
const css = ${JSON.stringify(`/* unocss */\n${css}`)}
updateStyle(id, css)
export default css
fetch('${READY_CALLBACK}', { method: 'POST', body: '${lastUpdate}' })
`
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
