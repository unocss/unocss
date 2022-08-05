import type { Plugin, Update, ViteDevServer, ResolvedConfig as ViteResolvedConfig } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import { notNull } from '@unocss/core'
import { LAYER_MARK_ALL, getHash, getPath, resolveId, resolveLayer } from '../../integration'

const WARN_TIMEOUT = 20000
const WS_EVENT_PREFIX = 'unocss:hmr'
const HASH_LENGTH = 6

export function GlobalModeDevPlugin({ uno, tokens, affectedModules, onInvalidate, extract, filter }: UnocssPluginContext): Plugin[] {
  const servers: ViteDevServer[] = []
  let base = ''

  const tasks: Promise<any>[] = []
  const entries = new Set<string>()

  let invalidateTimer: any
  const lastServedHash = new Map<string, string>()
  let lastServedTime = Date.now()
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
    invalidateTimer = setTimeout(() => {
      lastServedHash.clear()
      sendUpdate(ids)
    }, timer)
  }

  function sendUpdate(ids: Set<string>) {
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
              timestamp: lastServedTime,
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
    invalidate(10, new Set([...entries, ...affectedModules]))
  })

  return [
    {
      name: 'unocss:global',
      apply: 'serve',
      enforce: 'pre',
      configResolved,
      async configureServer(_server) {
        servers.push(_server)

        _server.ws.on(WS_EVENT_PREFIX, ([layer, hash]: string[]) => {
          if (lastServedHash.get(layer) !== hash)
            invalidate(10)
        })
      },
      buildStart() {
        // warm up for preflights
        uno.generate('', { preflights: true })
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

        const css = layer === LAYER_MARK_ALL
          ? result.getLayers(undefined, Array.from(entries)
            .map(i => resolveLayer(i)).filter((i): i is string => !!i))
          : result.getLayer(layer)
        const hash = getHash(css || '', HASH_LENGTH)
        lastServedHash.set(layer, hash)
        lastServedTime = Date.now()
        // add hash to the chunk of CSS that it will send back to client to check if there is new CSS generated
        return `/*${hash}*/${css}`
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
        const layer = resolveLayer(getPath(id))

        // inject css modules to send callback on css load
        if (layer && code.includes('import.meta.hot')) {
          return `${code}
if (import.meta.hot) {
  try { await import.meta.hot.send('${WS_EVENT_PREFIX}', ['${layer}', __vite__css.slice(2,${2 + HASH_LENGTH})]); }
  catch (e) { console.warn('[unocss-hmr]', e) }
  if (!import.meta.url.includes('?'))
    await new Promise(resolve => setTimeout(resolve, 100))
}`
        }
      },
    },
  ]
}
