import type { Plugin, Update, ViteDevServer, ResolvedConfig as ViteResolvedConfig } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import { notNull } from '@unocss/core'
import { LAYER_MARK_ALL, getPath, resolveId, resolveLayer } from '../../integration'

const WARN_TIMEOUT = 20000
const WS_EVENT_PREFIX = 'unocss:hmr'

export function GlobalModeDevPlugin({ uno, tokens, affectedModules, onInvalidate, extract, filter }: UnocssPluginContext): Plugin[] {
  const servers: ViteDevServer[] = []
  let base = ''

  const tasks: Promise<any>[] = []
  const entries = new Set<string>()

  let invalidateTimer: any
  let lastUpdate = Date.now()
  let lastServed = 0
  let resolved = false
  let resolvedWarnTimer: any

  function configResolved(config: ViteResolvedConfig) {
    base = config.base || ''
    if (base === '/')
      base = ''
    else if (base.endsWith('/'))
      base = base.slice(0, base.length - 1)
  }

  function invalidate(timer = 10, ids: Set<string> = entries) {
    for (const server of servers) {
      for (const id of ids) {
        const mod = server.moduleGraph.getModuleById(id)
        if (!mod)
          continue
        server!.moduleGraph.invalidateModule(mod)
      }
    }
    clearTimeout(invalidateTimer)
    invalidateTimer = setTimeout(() => sendUpdate(ids), timer)
  }

  function sendUpdate(ids: Set<string>) {
    lastUpdate = Date.now()
    for (const server of servers) {
      server.ws.send({
        type: 'update',
        updates: Array.from(ids)
          .map((id) => {
            const mod = server.moduleGraph.getModuleById(id)
            if (!mod)
              return null
            return <Update>{
              acceptedPath: mod.url,
              path: mod.url,
              timestamp: lastUpdate,
              type: 'js-update',
            }
          })
          .filter(notNull),
      })
    }
  }

  function setWarnTimer() {
    if (!resolved && !resolvedWarnTimer) {
      resolvedWarnTimer = setTimeout(() => {
        if (process.env.TEST || process.env.NODE_ENV === 'test')
          return
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

  onInvalidate(() => {
    invalidate(0, new Set([...entries, ...affectedModules]))
  })

  return [
    {
      name: 'unocss:global',
      apply: 'serve',
      enforce: 'pre',
      configResolved,
      async configureServer(_server) {
        servers.push(_server)

        _server.ws.on(WS_EVENT_PREFIX, (servedTime: number) => {
          if (servedTime < lastUpdate)
            invalidate(0)
        })
      },
      async buildStart() {
        await uno.generate('', { preflights: true })
      },
      transform(code, id) {
        if (filter(code, id))
          tasks.push(extract(code, id))
        return null
      },
      transformIndexHtml: {
        enforce: 'pre',
        transform(code, { filename }) {
          setWarnTimer()
          tasks.push(extract(code, filename))
        },
      },
      resolveId(id) {
        const entry = resolveId(id)
        if (entry) {
          resolved = true
          entries.add(entry)
          return entry
        }
      },
      async load(id) {
        const layer = resolveLayer(getPath(id))
        if (!layer)
          return null

        await Promise.all(tasks)
        const result = await uno.generate(tokens)
        lastServed = Date.now()
        return layer === LAYER_MARK_ALL
          ? result.getLayers(undefined, Array.from(entries)
            .map(i => resolveLayer(i)).filter((i): i is string => !!i))
          : result.getLayer(layer)
      },
    },
    {
      name: 'unocss:global:post',
      configResolved,
      apply(config, env) {
        return env.command === 'serve' && !config.build?.ssr
      },
      enforce: 'post',
      transform(code, id) {
        // inject css modules to send callback on css load
        if (entries.has(getPath(id)) && code.includes('import.meta.hot')) {
          const snippet = `\nif (import.meta.hot) { try { import.meta.hot.send('${WS_EVENT_PREFIX}', ${lastServed}) } catch (e) { console.warn('[unocss-hmr]', e) } }`
          return code + snippet
        }
      },
    },
  ]
}
