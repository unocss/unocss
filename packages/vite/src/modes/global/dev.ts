import type { Plugin, ViteDevServer } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, defaultInclude } from '../../utils'
import { Context } from '../../context'
import { READY_CALLBACK_DEFAULT, resolveId, ALL_LAYERS } from './shared'

const WARN_TIMEOUT = 2000

export function GlobalModeDevPlugin({ config, uno, tokens, onInvalidate, scan }: Context): Plugin[] {
  const servers: ViteDevServer[] = []

  const filter = createFilter(
    config.include || defaultInclude,
    config.exclude || defaultExclude,
  )

  const tasks: Promise<any>[] = []
  const entries = new Map<string, string>()

  let invalidateTimer: any
  let lastUpdate = Date.now()
  let lastServed = 0
  let resolved = false
  let resolvedWarnTimer: any

  function invalidate(timer = 10) {
    for (const server of servers) {
      for (const id of entries.keys()) {
        const mod = server.moduleGraph.getModuleById(id)
        if (!mod)
          continue
        lastUpdate = Date.now()
        server!.moduleGraph.invalidateModule(mod)
      }
    }
    clearTimeout(invalidateTimer)
    invalidateTimer = setTimeout(sendUpdate, timer)
  }

  function sendUpdate() {
    for (const server of servers) {
      server.ws.send({
        type: 'update',
        updates: Array.from(entries.keys()).map(i => ({
          acceptedPath: i,
          path: i,
          timestamp: lastUpdate,
          type: 'js-update',
        })),
      })
    }
  }

  function setWarnTimer() {
    if (!resolved && !resolvedWarnTimer) {
      resolvedWarnTimer = setTimeout(() => {
        if (!resolved) {
          const msg = '[unocss] entry module not found, have you add `import \'uno.css\'` in your main entry?'
          console.warn(msg)
          servers.forEach(({ ws }) => ws.send({
            type: 'error',
            err: { message: msg, stack: '' },
          }))
        }
      }, WARN_TIMEOUT)
    }
  }

  onInvalidate(invalidate)

  let base = '/'

  return [
    {
      name: 'unocss:global',
      apply: 'serve',
      enforce: 'pre',
      configResolved(config) {
        base = config.base
      },
      configureServer(_server) {
        servers.push(_server)
        _server.middlewares.use(async(req, res, next) => {
          setWarnTimer()
          if (req.url?.startsWith(READY_CALLBACK_DEFAULT)) {
            const servedTime = +req.url.slice(READY_CALLBACK_DEFAULT.length + 1)
            if (servedTime < lastUpdate)
              invalidate(0)
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
        const entry = resolveId(id, base)
        if (entry) {
          resolved = true
          entries.set(entry.id, entry.layer)
          return entry.id
        }
      },
      async load(id) {
        const layer = entries.get(id)
        if (!layer)
          return null

        await Promise.all(tasks)
        const result = await uno.generate(tokens)
        lastServed = Date.now()
        if (layer === ALL_LAYERS)
          return result.css
        else
          return result.getLayer(layer)
      },
    },
    {
      name: 'unocss:global:post',
      apply(config, env) {
        return env.command === 'serve' && !config.build?.ssr
      },
      enforce: 'post',
      transform(code, id) {
        if (entries.has(id) && code.includes('import.meta.hot'))
          return `${code}\nawait fetch("${READY_CALLBACK_DEFAULT}/${lastServed}")`
      },
    },
  ]
}
