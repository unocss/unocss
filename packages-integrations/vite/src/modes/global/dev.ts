import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { EnvironmentModuleGraph, EnvironmentModuleNode, Plugin, ViteDevServer } from 'vite'
import type { VitePluginConfig } from '../../types'
import process from 'node:process'
import MagicString from 'magic-string'
import { LAYER_MARK_ALL } from '#integration/constants'
import { getHash } from '#integration/hash'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath } from '#integration/utils'
import { isConfigSource } from '../../config-hmr'
import { toViteVirtualId } from '../../virtual'
import { MESSAGE_UNOCSS_ENTRY_NOT_FOUND } from './shared'

const WARN_TIMEOUT = 20000
const HASH_LENGTH = 6
const REFRESH_EVENT = 'unocss:refresh'

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
  const { tokens, tasks, flushTasks, extract, filter, getConfig } = ctx
  const entries = new Set<string>()

  const lastServedHash = new Map<string, string>()
  let resolved = false
  let server: ViteDevServer | undefined
  let resolvedWarnTimer: TimeoutTimer
  let refreshTimer: TimeoutTimer

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
      ? result.getLayers(undefined, await Promise.all(Array.from(entries)
          .map(i => resolveLayer(ctx, i))).then(layers => layers.filter((i): i is string => !!i)))
      : result.getLayer(layer)
    const hash = getHash(css || '', HASH_LENGTH)
    lastServedHash.set(layer, hash)
    return { hash, css }
  }

  /**
   * Return the imported entries whose generated CSS differs from what the
   * client holds, so that Vite can build the HMR update itself.
   */
  async function regenerateChangedModules(moduleGraph: EnvironmentModuleGraph) {
    const changed: EnvironmentModuleNode[] = []
    for (const id of entries) {
      const mod = moduleGraph.getModuleById(id)
      if (!mod)
        continue
      const layer = await resolveLayer(ctx, getPath(id))
      if (!layer)
        continue
      const previousHash = lastServedHash.get(layer)
      const { hash } = await generateCSS(layer)
      if (hash !== previousHash)
        changed.push(mod)
    }
    return changed
  }

  /**
   * A lazily imported module is transformed for the first time after the CSS
   * module already loaded, so no file changed and `hotUpdate` does not run.
   * Ask the client to re-import the CSS module when new tokens change the CSS.
   */
  function scheduleRefresh() {
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(async () => {
      if (!server)
        return
      const environment = server.environments.client
      const changed = await regenerateChangedModules(environment.moduleGraph)
      if (changed.length)
        environment.hot.send({ type: 'custom', event: REFRESH_EVENT })
    }, 10)
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

  return [
    {
      name: 'unocss:global',
      apply: 'serve',
      enforce: 'pre',
      configureServer(_server) {
        server = _server
      },
      buildStart() {
        // warm up for preflights
        ctx.uno.generate([], { preflights: true })
      },
      transform(code, id) {
        if (filter(code, id)) {
          const previousTokenCount = tokens.size
          tasks.push(extract(code, id).then(() => {
            if (tokens.size > previousTokenCount)
              scheduleRefresh()
          }))
        }
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
        // Run after other plugins narrowed the module list, so the appended
        // CSS modules are not dropped, and after the config plugin reloaded a
        // changed config file.
        order: 'post',
        async handler({ file, modules, read, type }) {
          if (this.environment.name !== 'client' || type === 'delete')
            return

          // HTML is re-extracted by the transformIndexHtml hook. Returning here
          // keeps Vite's page reload for HTML changes.
          if (file.endsWith('.html'))
            return

          // The config plugin already reloaded the config, so only the CSS has
          // to be refreshed. Config files are not content sources.
          if (!isConfigSource(ctx, file)) {
            // Skip files that are neither modules nor potential content sources
            // (for example assets), so that large binaries are never read.
            if (modules.length === 0 && !filter('', file))
              return

            let code: string
            try {
              code = await read()
            }
            catch {
              return
            }
            if (!filter(code, file))
              return
            await extract(code, file)
          }

          const changed = await regenerateChangedModules(this.environment.moduleGraph)
          if (!changed.length)
            return

          return [...new Set([...modules, ...changed])]
        },
      },
      async resolveId(id) {
        const entry = await resolveId(ctx, id)
        if (entry) {
          resolved = true
          clearWarnTimer()
          const virtualId = toViteVirtualId(entry)
          entries.add(virtualId)
          return virtualId
        }
      },
      async load(id) {
        const layer = await resolveLayer(ctx, getPath(id))
        if (!layer)
          return null

        const { css } = await generateCSS(layer)
        return {
          code: css ?? '',
          map: { mappings: '' },
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

        if (layer && !/(?:\\?|&)t=/.test(id) && code.includes('import.meta.hot')) {
          const s = new MagicString(code)
          s.append(REFRESH_SNIPPET)
          return {
            code: s.toString(),
            map: s.generateMap() as any,
          }
        }
      },
    },
  ]
}
