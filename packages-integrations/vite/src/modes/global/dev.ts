import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { Plugin, Update, ViteDevServer } from 'vite'
import type { VitePluginConfig } from '../../types'
import process from 'node:process'
import { LAYER_MARK_ALL } from '#integration/constants'
import { getHash } from '#integration/hash'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath } from '#integration/utils'
import { notNull } from '@unocss/core'
import MagicString from 'magic-string'
import { MESSAGE_UNOCSS_ENTRY_NOT_FOUND } from './shared'

const WARN_TIMEOUT = 20000
const WS_EVENT_PREFIX = 'unocss:hmr'
const HASH_LENGTH = 6

type TimeoutTimer = ReturnType<typeof setTimeout> | undefined

export function GlobalModeDevPlugin(ctx: UnocssPluginContext): Plugin[] {
  const { tokens, tasks, flushTasks, affectedModules, onInvalidate, extract, filter, getConfig } = ctx
  const servers: ViteDevServer[] = []
  const entries = new Set<string>()

  let invalidateTimer: TimeoutTimer
  const lastServedHash = new Map<string, string>()
  let lastServedTime = Date.now()
  let resolved = false
  let resolvedWarnTimer: TimeoutTimer

  async function generateCSS(layer: string) {
    await flushTasks()
    let result: GenerateResult
    let tokensSize = tokens.size
    do {
      result = await ctx.uno.generate(tokens)
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

  async function setWarnTimer() {
    if (
      !resolved
      && !resolvedWarnTimer
      && (await getConfig() as VitePluginConfig).checkImport
    ) {
      resolvedWarnTimer = setTimeout(() => {
        if (process.env.TEST || process.env.NODE_ENV === 'test')
          return
        if (!resolved) {
          console.warn(MESSAGE_UNOCSS_ENTRY_NOT_FOUND)
          servers.forEach(({ ws }) => ws.send({
            type: 'error',
            err: { message: MESSAGE_UNOCSS_ENTRY_NOT_FOUND, stack: '' },
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
        ctx.uno.generate([], { preflights: true })
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
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore Compatibility with Legacy Vite
        enforce: 'pre',
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore Compatibility with Legacy Vite
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
