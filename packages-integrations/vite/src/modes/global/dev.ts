import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { EnvironmentModuleGraph, EnvironmentModuleNode, HotUpdateOptions, Plugin, ViteDevServer } from 'vite'
import type { VitePluginConfig } from '../../types'
import process from 'node:process'
import MagicString from 'magic-string'
import { LAYER_MARK_ALL } from '#integration/constants'
import { getHash } from '#integration/hash'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath, splitEntryId } from '#integration/utils'
import { consumeConfigSource, isConfigSource } from '../../config-hmr'
import { toViteVirtualId } from '../../virtual'
import { MESSAGE_UNOCSS_ENTRY_NOT_FOUND } from './shared'

const WARN_TIMEOUT = 20000
const HASH_LENGTH = 6
const REFRESH_EVENT = 'unocss:refresh'
const READY_EVENT = 'unocss:ready'

const REFRESH_SNIPPET = `
if (import.meta.hot) {
  import.meta.hot.on('${REFRESH_EVENT}', async () => {
    const url = new URL(import.meta.url)
    url.searchParams.set('t', Date.now())
    try {
      await import(/* @vite-ignore */ url.href)
    } catch (e) {
      console.warn('[unocss-hmr]', e)
    }
  })
}`

type TimeoutTimer = ReturnType<typeof setTimeout> | undefined

export function GlobalModeDevPlugin(ctx: UnocssPluginContext): Plugin[] {
  const { tokens, tasks, flushTasks, extract, filter, getConfig, onInvalidate } = ctx
  const entries = new Set<string>()

  const lastUpdateHash = new Map<string, string>()
  let resolved = false
  let server: ViteDevServer | undefined
  let resolvedWarnTimer: TimeoutTimer
  let refreshTimer: TimeoutTimer

  async function generateResult() {
    await flushTasks()
    let result: GenerateResult
    let tokensSize = tokens.size
    do {
      result = await ctx.uno.generate(tokens)
      // to capture new tokens created during generation
      if (tokensSize === tokens.size)
        return result
      tokensSize = tokens.size
    } while (true)
  }

  async function generateCSS(layer: string, result?: GenerateResult) {
    result ??= await generateResult()
    const css
      = layer === LAYER_MARK_ALL
        ? result.getLayers(
            undefined,
            await Promise.all(
              Array.from(entries).map(i => resolveLayer(ctx, getPath(i))),
            ).then(layers => layers.filter((i): i is string => !!i)),
          )
        : result.getLayer(layer)
    const hash = getHash(css || '', HASH_LENGTH)
    return { hash, css }
  }

  async function regenerateChangedModules(moduleGraph: EnvironmentModuleGraph) {
    const changed: EnvironmentModuleNode[] = []
    const result = await generateResult()
    const generatedCSS = new Map<string, { hash: string }>()
    for (const id of entries) {
      const mod = moduleGraph.getModuleById(id)
      if (!mod)
        continue
      const layer = await resolveLayer(ctx, getPath(id))
      if (!layer)
        continue
      const previousHash = lastUpdateHash.get(id)
      let css = generatedCSS.get(layer)
      if (!css) {
        css = await generateCSS(layer, result)
        generatedCSS.set(layer, css)
      }
      if (css.hash !== previousHash) {
        changed.push(mod)
        lastUpdateHash.set(id, css.hash)
      }
    }
    return changed
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      void refresh()
    }, 10)
  }

  onInvalidate(scheduleRefresh)

  async function refresh() {
    try {
      if (!server)
        return
      const environment = server.environments.client
      const changed = await regenerateChangedModules(environment.moduleGraph)
      if (!changed.length)
        return

      for (const module of changed) {
        if (module.type === 'css' || module.isSelfAccepting === false)
          await environment.reloadModule(module)
        else
          environment.moduleGraph.invalidateModule(module)
      }
      environment.hot.send({ type: 'custom', event: REFRESH_EVENT })
    }
    catch (error) {
      console.warn('[unocss-hmr]', error)
    }
  }

  async function setWarnTimer() {
    if (
      !resolved
      && !resolvedWarnTimer
      && ((await getConfig()) as VitePluginConfig).checkImport
    ) {
      resolvedWarnTimer = setTimeout(() => {
        if (process.env.TEST || process.env.NODE_ENV === 'test')
          return
        if (!resolved) {
          console.warn(MESSAGE_UNOCSS_ENTRY_NOT_FOUND)
          server?.environments.client.hot.send({
            type: 'error',
            err: { message: MESSAGE_UNOCSS_ENTRY_NOT_FOUND, stack: '' },
          })
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

  async function prepareHotUpdate({
    file,
    modules,
    read,
    type,
  }: HotUpdateOptions) {
    if (type === 'delete') {
      let removed = false
      for (const id of ctx.modules.keys()) {
        if (getPath(id) === file) {
          ctx.modules.delete(id)
          removed = true
        }
      }
      if (removed) {
        await flushTasks()
        tokens.clear()
        await Promise.all(ctx.modules.map((code, id) => extract(code, id)))
        ctx.invalidate()
      }
      return true
    }

    if (file.endsWith('.html'))
      return false

    if (isConfigSource(ctx, file))
      return true

    if (modules.length === 0 && !filter('', file))
      return false

    let code: string
    try {
      code = await read()
    }
    catch {
      return false
    }
    if (!filter(code, file))
      return false
    await extract(code, file)
    return true
  }

  return [
    {
      name: 'unocss:global',
      apply: 'serve',
      enforce: 'pre',
      configureServer(_server) {
        server = _server
        const environment = server.environments.client
        const { hot, moduleGraph } = environment
        hot.on(READY_EVENT, async ({ id, hash }: { id: string, hash: string }, client) => {
          const module = moduleGraph.getModuleById(id)
          if (!module)
            return
          if (module.isSelfAccepting === false) {
            const layer = await resolveLayer(ctx, getPath(id))
            if (layer && (await generateCSS(layer)).hash !== hash)
              await environment.reloadModule(module)
          }
          else {
            moduleGraph.invalidateModule(module)
            client.send({ type: 'custom', event: REFRESH_EVENT })
          }
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
      },
      hotUpdate: {
        order: 'post',
        async handler(options) {
          if (this.environment.name !== 'client' || !(await prepareHotUpdate(options)))
            return

          consumeConfigSource(ctx, options.file)
          const changed = await regenerateChangedModules(this.environment.moduleGraph)
          if (!changed.length)
            return

          return [...new Set([...options.modules, ...changed])]
        },
      },
      async resolveId(id) {
        const entry = await resolveId(ctx, id)
        if (entry) {
          resolved = true
          clearWarnTimer()
          const { filename, query } = splitEntryId(entry)
          const serveId = query ? toViteVirtualId(`/${filename}${query}`) : `/${filename}`
          entries.add(serveId)
          return serveId
        }
      },
      async load(id) {
        const layer = await resolveLayer(ctx, getPath(id))
        if (!layer)
          return null

        entries.add(id)

        const { css, hash } = await generateCSS(layer)
        if (!lastUpdateHash.has(id))
          lastUpdateHash.set(id, hash)
        return {
          code: css ?? '',
          map: { mappings: '' },
          meta: { unocssHash: hash },
        }
      },
      closeBundle() {
        clearWarnTimer()
        clearTimeout(refreshTimer)
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
        const hasRefreshListener = code.includes('import.meta.hot')
        const inline = new URLSearchParams(splitEntryId(id).query).has('inline')
        if (layer && (hasRefreshListener || inline)) {
          const s = new MagicString(code)
          if (hasRefreshListener)
            s.append(REFRESH_SNIPPET)
          const hash = this.getModuleInfo(id)?.meta.unocssHash
          s.append(`
if (import.meta.hot && !import.meta.hot.data.unocssReady) {
  import.meta.hot.data.unocssReady = true
  import.meta.hot.send('${READY_EVENT}', ${JSON.stringify({ id, hash })})
}`)
          return {
            code: s.toString(),
            map: s.generateMap() as any,
          }
        }
      },
    },
  ]
}
