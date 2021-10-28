import type { Plugin, ViteDevServer } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, defaultInclude } from './utils'
import { Context } from './context'

const VIRTUAL_ENTRY = '/@unocss-entry.css'
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

  let mainEntry: string | undefined

  return {
    name: 'unocss:global',
    apply: 'serve',
    enforce: 'pre',
    buildStart() {
      mainEntry = undefined
    },
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
    transform(code, id, context) {
      // @ts-expect-error
      const isSSR = context === true || context?.ssr === true
      if (filter(id))
        scan(code, id)

      // we treat the first incoming module as the main entry
      if (!isSSR && (mainEntry == null || mainEntry === id) && !id.includes('node_modules/vite')) {
        mainEntry = id
        return {
          code: `await import("${VIRTUAL_ENTRY}").then(() => fetch('${READY_CALLBACK}'));${code}`,
          map: {
            mappings: '',
          },
        }
      }

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
  }
}
