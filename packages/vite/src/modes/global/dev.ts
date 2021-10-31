import type { Plugin, ViteDevServer } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, defaultInclude } from '../../utils'
import { Context } from '../../context'
import { READY_CALLBACK, VIRTUAL_ENTRY, VIRTUAL_ENTRY_ALIAS } from './shared'

const WARN_TIMEOUT = 2000

export function GlobalModeDevPlugin({ config, uno, tokens, onInvalidate, scan }: Context): Plugin[] {
  let server: ViteDevServer | undefined

  const filter = createFilter(
    config.include || defaultInclude,
    config.exclude || defaultExclude,
  )

  const tasks: Promise<any>[] = []
  let invalidateTimer: any
  let lastUpdate = Date.now()
  let lastServed = 0
  let resolved = false
  let resolvedWarnTimer: any

  function invalidate(timer = 10) {
    if (!server)
      return
    const mod = server.moduleGraph.getModuleById(VIRTUAL_ENTRY)
    if (!mod)
      return
    lastUpdate = Date.now()
    server!.moduleGraph.invalidateModule(mod)
    clearTimeout(invalidateTimer)
    invalidateTimer = setTimeout(sendUpdate, timer)
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

  function setWarnTimer() {
    if (!resolved && !resolvedWarnTimer) {
      resolvedWarnTimer = setTimeout(() => {
        if (!resolved) {
          const msg = '[unocss] entry module not found, have you add `import \'uno.css\'` in your main entry?'
          console.warn(msg)
          server!.ws.send({
            type: 'error',
            err: { message: msg, stack: '' },
          })
        }
      }, WARN_TIMEOUT)
    }
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
          setWarnTimer()
          if (req.url?.startsWith(READY_CALLBACK)) {
            const servedTime = +req.url.slice(READY_CALLBACK.length + 1)
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
        if (VIRTUAL_ENTRY_ALIAS.includes(id)) {
          resolved = true
          return VIRTUAL_ENTRY
        }
      },
      async load(id) {
        if (id !== VIRTUAL_ENTRY)
          return null

        await Promise.all(tasks)
        const { css } = await uno.generate(tokens)
        lastServed = Date.now()
        return css
      },
    },
    {
      name: 'unocss:global:post',
      apply(config, env) {
        return env.command === 'serve' && !config.build?.ssr
      },
      enforce: 'post',
      transform(code, id) {
        if (id === VIRTUAL_ENTRY && code.includes('import.meta.hot'))
          return `${code}\nawait fetch("${READY_CALLBACK}/${lastServed}")`
      },
    },
  ]
}
