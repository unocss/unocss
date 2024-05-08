import process from 'node:process'
import type { Plugin, Update, ViteDevServer } from 'vite'
import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import { notNull } from '@unocss/core'
import MagicString from 'magic-string'
import type { VitePluginConfig } from '../../types'
import { LAYER_MARK_ALL, getHash, getPath, resolveId, resolveLayer } from '../../integration'

const WARN_TIMEOUT = 20000
const WS_EVENT_PREFIX = 'unocss:hmr'
const HASH_LENGTH = 6

export function GlobalModeDevPlugin({ uno, tokens, tasks, flushTasks, affectedModules, onInvalidate, extract, filter, getConfig }: UnocssPluginContext): Plugin[] {
  const servers: ViteDevServer[] = []
  const entries = new Set<string>()

  let invalidateTimer: any
  const lastServedHash = new Map<string, string>()
  let lastServedTime = Date.now()
  let resolved = false
  let resolvedWarnTimer: any

  async function generateCSS(layer: string) {
    await flushTasks()
    let result: GenerateResult
    let tokensSize = tokens.size
    do {
      result = await uno.generate(tokens)
      // to capture new tokens created during generation
      if (tokensSize === tokens.size)
        break
      tokensSize = tokens.size
    } while (true)

    const css = layer === LAYER_MARK_ALL
      ? result.getLayers(undefined, Array.from(entries)
        .map(i => resolveLayer(i)).filter((i): i is string => !!i))
      : result.getLayer(layer)
    const hash = getHash(css || '', HASH_LENGTH)
    lastServedHash.set(layer, hash)
    lastServedTime = Date.now()
    return { hash, css }
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
            return {
              acceptedPath: mod.url,
              path: mod.url,
              timestamp: lastServedTime,
              type: 'js-update',
            } as Update
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
          const msg = '[unocss] Entry module not found. Did you add `import \'uno.css\'` in your main entry?'
          console.warn(msg)
          servers.forEach(({ ws }) => ws.send({
            type: 'error',
            err: { message: msg, stack: '' },
          }))
        }
      }, WARN_TIMEOUT)
    }
  }

  function clearWarnTimer() {
    if (resolvedWarnTimer) {
      clearTimeout(resolvedWarnTimer)
      resolvedWarnTimer = undefined
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
      async configureServer(_server) {
        servers.push(_server)

        _server.ws.on(WS_EVENT_PREFIX, async ([layer]: string[]) => {
          const preHash = lastServedHash.get(layer)
          await generateCSS(layer)
          if (lastServedHash.get(layer) !== preHash)
            sendUpdate(entries)
        })
      },
      buildStart() {
        // warm up for preflights
        uno.generate([], { preflights: true })
      },
      transform(code, id) {
        if (filter(code, id))
          tasks.push(extract(code, id))
        return null
      },
      transformIndexHtml: {
        order: 'pre',
        handler(code, { filename }) {
          setWarnTimer()
          tasks.push(extract(code, filename))
        },
        // Compatibility with Legacy Vite
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
          clearWarnTimer()
          entries.add(entry)
          return entry
        }
      },
      async load(id) {
        const layer = resolveLayer(getPath(id))
        if (!layer)
          return null

        const { hash, css } = await generateCSS(layer)
        return {
          // add hash to the chunk of CSS that it will send back to client to check if there is new CSS generated
          code: `${css}__uno_hash_${hash}{--:'';}`,
          map: { mappings: '' },
        }
      },
      closeBundle() {
        clearWarnTimer()
      },
    },
    {
      name: 'unocss:global:post',
      apply(config, env) {
        return env.command === 'serve' && !config.build?.ssr
      },
      enforce: 'post',
      async transform(code, id) {
        const layer = resolveLayer(getPath(id))

        // inject css modules to send callback on css load
        if (layer && code.includes('import.meta.hot')) {
          let hmr = `
try {
  let hash = __vite__css.match(/__uno_hash_(\\w{${HASH_LENGTH}})/)
  hash = hash && hash[1]
  if (!hash)
    console.warn('[unocss-hmr]', 'failed to get unocss hash, hmr might not work')
  else
    await import.meta.hot.send('${WS_EVENT_PREFIX}', ['${layer}']);
} catch (e) {
  console.warn('[unocss-hmr]', e)
}
if (!import.meta.url.includes('?'))
  await new Promise(resolve => setTimeout(resolve, 100))`

          const config = await getConfig() as VitePluginConfig

          if (config.hmrTopLevelAwait === false)
            hmr = `;(async function() {${hmr}\n})()`
          hmr = `\nif (import.meta.hot) {${hmr}}`

          const s = new MagicString(code)
          s.append(hmr)

          return {
            code: s.toString(),
            map: s.generateMap() as any,
          }
        }
      },
    },
  ]
}
