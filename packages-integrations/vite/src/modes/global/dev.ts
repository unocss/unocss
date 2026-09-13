import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { Plugin, Update, ViteDevServer } from 'vite'
import type { VitePluginConfig } from '../../types'
import process from 'node:process'
import { LAYER_MARK_ALL } from '#integration/constants'
import { getHash } from '#integration/hash'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath } from '#integration/utils'
import { consumeConfigSource, isConfigSource } from '../../config-hmr'
import { toViteVirtualId } from '../../virtual'
import { MESSAGE_UNOCSS_ENTRY_NOT_FOUND } from './shared'

const WARN_TIMEOUT = 20000
const HASH_LENGTH = 6
interface HmrModule {
  id: string | null
  url: string
  transformResult?: { code: string } | null
}

/**
 * Vite 6 and 7 register the hot context under the wrapped public URL
 * (`/@id/__x00__/__uno.css`), while Vite 8.3 registers the raw module URL.
 * Read the path Vite actually injected so the update reaches the client on
 * every supported version.
 */
function getRegisteredHmrPath(module: HmrModule): string {
  const injected = module.transformResult?.code?.match(
    /__vite__createHotContext\("((?:[^"\\]|\\.)*)"\)/,
  )
  if (!injected)
    return module.url
  try {
    return JSON.parse(`"${injected[1]}"`)
  }
  catch {
    return module.url
  }
}
interface HmrModuleGraph<Module extends HmrModule> {
  getModuleById: (id: string) => Module | undefined
}
interface HotUpdateContext<Module extends HmrModule> {
  file: string
  modules: Module[]
  read: () => string | Promise<string>
  type?: string
}
type TimeoutTimer = ReturnType<typeof setTimeout> | undefined

export function GlobalModeDevPlugin(ctx: UnocssPluginContext): Plugin[] {
  const { tokens, tasks, flushTasks, extract, filter, getConfig } = ctx
  const entries = new Set<string>()

  const lastServedHash = new Map<string, string>()
  let resolved = false
  let server: ViteDevServer | undefined
  let resolvedWarnTimer: TimeoutTimer
  let updateTimer: TimeoutTimer

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
              Array.from(entries).map(i => resolveLayer(ctx, i)),
            ).then(layers => layers.filter((i): i is string => !!i)),
          )
        : result.getLayer(layer)
    const hash = getHash(css || '', HASH_LENGTH)
    lastServedHash.set(layer, hash)
    return { hash, css }
  }

  /**
   * Return the imported entries whose generated CSS differs from what the
   * client holds, so that Vite can build the HMR update itself.
   */
  async function regenerateChangedModules<Module extends HmrModule>(
    moduleGraph: HmrModuleGraph<Module>,
  ) {
    const changed: Module[] = []
    const result = await generateResult()
    const generatedCSS = new Map<string, { hash: string }>()
    for (const id of entries) {
      const mod = moduleGraph.getModuleById(id)
      if (!mod)
        continue
      const layer = await resolveLayer(ctx, getPath(id))
      if (!layer)
        continue
      const previousHash = lastServedHash.get(layer)
      let css = generatedCSS.get(layer)
      if (!css) {
        css = await generateCSS(layer, result)
        generatedCSS.set(layer, css)
      }
      if (css.hash !== previousHash)
        changed.push(mod)
    }
    return changed
  }

  /**
   * A lazily imported module is transformed for the first time after the CSS
   * module already loaded, so no file changed and `hotUpdate` does not run.
   * Ask Vite to apply a normal update when new tokens change the CSS.
   */
  function scheduleUpdate() {
    clearTimeout(updateTimer)
    updateTimer = setTimeout(() => {
      void updateCSS()
    }, 10)
  }

  async function updateCSS() {
    try {
      if (!server)
        return
      const environment = server.environments.client
      const changed = await regenerateChangedModules(environment.moduleGraph)
      if (!changed.length)
        return

      const timestamp = Date.now()
      const updates: Update[] = changed.map((module) => {
        const path = getRegisteredHmrPath(module)
        return { type: 'js-update', path, acceptedPath: path, timestamp }
      })
      for (const module of changed)
        environment.moduleGraph.invalidateModule(module, undefined, timestamp)
      environment.hot.send({ type: 'update', updates })
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
  }: HotUpdateContext<HmrModule>) {
    if (type === 'delete') {
      if (ctx.modules.delete(file))
        await ctx.reloadConfig()
      return true
    }

    // HTML is re-extracted by the transformIndexHtml hook. Returning here
    // keeps Vite's page reload for HTML changes.
    if (file.endsWith('.html'))
      return false

    // The config plugin already reloaded the config, so only the CSS has
    // to be refreshed. Config files are not content sources.
    if (isConfigSource(ctx, file))
      return true

    // Skip files that are neither modules nor potential content sources
    // (for example assets), so that large binaries are never read.
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
      },
      buildStart() {
        // warm up for preflights
        ctx.uno.generate([], { preflights: true })
      },
      transform(code, id) {
        if (filter(code, id)) {
          const previousTokenCount = tokens.size
          tasks.push(
            extract(code, id).then(() => {
              if (tokens.size > previousTokenCount)
                scheduleUpdate()
            }),
          )
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
        clearTimeout(updateTimer)
      },
    },
  ]
}
