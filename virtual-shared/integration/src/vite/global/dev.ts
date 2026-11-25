import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin, Update, ViteDevServer } from 'vite'
import type { BaseVitePluginConfig } from '../types'
import process from 'node:process'
import MagicString from 'magic-string'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath, splitEntryId } from '#integration/utils'
import { toViteClientPath, toViteVirtualId } from '../virtual'

const WARN_TIMEOUT = 20000
const WS_EVENT_PREFIX = 'unocss:hmr'

/**
 * Serve normal entries through a path id so prerendered `<link>` URLs round-trip (#5406),
 * but keep inline requests virtual so Vite skips filesystem checks (#5494).
 */
function toServeId(id: string) {
  const { filename, query } = splitEntryId(id)
  const serveId = `/${filename}${query}`
  return new URLSearchParams(query).has('inline')
    ? toViteVirtualId(serveId)
    : serveId
}

type TimeoutTimer = ReturnType<typeof setTimeout> | undefined

export function buildGlobalModeDevPlugin(
  ctx: UnocssPluginContext,
  generateCSS: (
    layer: string,
  ) => Promise<
    { hash: string, css: string | null | undefined } | null | undefined
  >,
  lastServedHashes: Map<string, string>,
  getLastServedMillis: () => number,
  entries: Set<string>,
  hashLength: number,
  decideEntryResolved: (entry: string) => boolean | Promise<boolean>,
  entryNotFoundMessage: string,
): Plugin[] {
  const { tasks, affectedModules, onInvalidate, extract, filter, getConfig }
    = ctx
  const servers: ViteDevServer[] = []

  let invalidateTimer: TimeoutTimer
  let resolved = false
  let resolvedWarnTimer: TimeoutTimer

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
      lastServedHashes.clear()
      sendUpdate(ids)
    }, timer)
  }

  function sendUpdate(ids: Set<string>) {
    for (const server of servers) {
      server.ws.send({
        type: 'update',
        updates: Array.from(ids).flatMap((id) => {
          const mod = server.moduleGraph.getModuleById(id)
          if (!mod)
            return []
          // Vite < 8.3 keys the client module registry by the wrapped
          // `/@id/__x00__` form, >= 8.3 by the raw module URL (vitejs/vite#23172).
          // Send both; the client silently ignores paths it doesn't know.
          return [...new Set([mod.url, toViteClientPath(mod.url)])].map(
            path =>
              ({
                acceptedPath: path,
                path,
                timestamp: getLastServedMillis(),
                type: 'js-update',
              }) as Update,
          )
        }),
      })
    }
  }

  async function setWarnTimer(this: { warn: (msg: string) => void }) {
    if (
      !resolved
      && !resolvedWarnTimer
      && ((await getConfig()) as BaseVitePluginConfig).checkImport !== false
    ) {
      clearTimeout(resolvedWarnTimer)
      resolvedWarnTimer = setTimeout(() => {
        if (process.env.TEST || process.env.NODE_ENV === 'test')
          return
        if (!resolved) {
          this.warn(entryNotFoundMessage)
          servers.forEach(({ ws }) =>
            ws.send({
              type: 'error',
              err: { message: entryNotFoundMessage, stack: '' },
            }),
          )
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
          const preHash = lastServedHashes.get(layer)
          await generateCSS(layer)
          if (lastServedHashes.get(layer) !== preHash)
            sendUpdate(entries)
        })
      },
      buildStart() {
        // warm up for preflights
        ctx.uno.generate([], { preflights: true })
      },
      transform(code, id) {
        if (filter(code, id)) {
          setWarnTimer.call(this)
          tasks.push(extract(code, id))
        }
        return null
      },
      transformIndexHtml: {
        order: 'pre',
        handler(code, { filename }) {
          setWarnTimer.call(this)
          tasks.push(extract(code, filename))
        },
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore Compatibility with Legacy Vite
        enforce: 'pre',
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore Compatibility with Legacy Vite
        transform(code, { filename }) {
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-ignore Compatibility with Legacy Vite
          setWarnTimer.call(this)
          tasks.push(extract(code, filename))
        },
      },
      async resolveId(id) {
        const entry = await resolveId(ctx, id)
        if (entry) {
          if (await decideEntryResolved(entry)) {
            resolved = true
            clearWarnTimer()
          }

          const serveId = toServeId(entry)
          entries.add(serveId)
          return serveId
        }
      },
      async load(id) {
        const layer = await resolveLayer(ctx, getPath(id))
        if (!layer)
          return null

        // Integrations (e.g. `@unocss/astro`) may resolve the entry to a plain
        // path id instead of the virtual id returned from `resolveId`, so track
        // every id that is actually served for HMR invalidation.
        entries.add(id)

        const generated = await generateCSS(layer)
        if (generated) {
          return {
            // add hash to the chunk of CSS that it will send back to client to check if there is new CSS generated
            code: `${generated.css}__uno_hash_${generated.hash}{--:'';}`,
            map: { mappings: '' },
          }
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
        const layer = await resolveLayer(ctx, getPath(id))

        // inject css modules to send callback on css load
        if (layer && code.includes('import.meta.hot')) {
          let hmr = `
try {
  let hash = __vite__css.match(/__uno_hash_(\\w{${hashLength}})/)
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

          const config = (await getConfig()) as BaseVitePluginConfig

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
