import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { Plugin, ResolvedConfig, Rollup, Update, ViteDevServer } from 'vite'
import { LAYER_MARK_ALL } from '#integration/constants'
import { defaultPipelineExclude } from '#integration/defaults'
import { getHash } from '#integration/hash'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath } from '#integration/utils'
import { notNull } from '@unocss/core'
import { createFilter } from 'unplugin-utils'

const virtualModuleCSS = 'uno.css'
const HASH_LENGTH = 6

export function VueScopedPlugin(ctx: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.vue$/], defaultPipelineExclude)
  let globalLayers: string[] = []
  let viteConfig: ResolvedConfig
  let cssPostPlugin: Plugin | undefined
  const servers: ViteDevServer[] = []
  const entries = new Set<string>()
  const lastServedHash = new Map<string, string>()
  let lastServedTime = Date.now()
  let invalidateTimer: ReturnType<typeof setTimeout> | undefined

  async function generateCSS(layer: string) {
    await ctx.flushTasks()
    let result: GenerateResult
    let tokensSize = ctx.tokens.size

    while (true) {
      result = await ctx.uno.generate(ctx.tokens)
      if (tokensSize === ctx.tokens.size)
        break
      tokensSize = ctx.tokens.size
    }

    const css = layer === LAYER_MARK_ALL
      ? result.getLayers(globalLayers)
      : result.getLayer(layer)

    const hash = getHash(css || '', HASH_LENGTH)
    lastServedHash.set(layer, hash)
    lastServedTime = Date.now()
    return { hash, css }
  }

  async function transformSFC(code: string, id: string) {
    await ctx.ready

    ctx.tasks.push(ctx.extract(code, id))
    const { getLayers, matched } = await ctx.uno.generate(code)

    if (matched.size === 0)
      return null

    return [
      `<style src="${virtualModuleCSS}" />`,
      code,
      `<style scoped>${getLayers(undefined, globalLayers)}</style>`,
    ].join('\n')
  }

  function sendUpdate(ids: Set<string> = entries) {
    for (const server of servers) {
      server.ws.send({
        type: 'update',
        updates: Array.from(ids)
          .map((id): Update | null => {
            const mod = server.moduleGraph.getModuleById(id)
            return mod
              ? {
                  acceptedPath: mod.url,
                  path: mod.url,
                  timestamp: lastServedTime,
                  type: 'js-update',
                }
              : null
          })
          .filter(notNull),
      })
    }
  }

  async function invalidate(ids: Set<string> = entries, timer = 10) {
    if (ids.size > 0) {
      const previousHash = lastServedHash.get(LAYER_MARK_ALL)
      const { hash } = await generateCSS(LAYER_MARK_ALL)

      if (hash === previousHash)
        return
    }

    for (const server of servers) {
      for (const id of ids) {
        const mod = server.moduleGraph.getModuleById(id)
        if (!mod)
          continue
        server.moduleGraph.invalidateModule(mod)
      }
    }
    clearTimeout(invalidateTimer)
    invalidateTimer = setTimeout(() => {
      sendUpdate(ids)
    }, timer)
  }

  ctx.onInvalidate(invalidate)

  return {
    name: 'unocss:vue-scoped',
    enforce: 'pre',
    configureServer(server) {
      servers.push(server)
    },
    async configResolved(_config) {
      viteConfig = _config
      const { config } = await ctx.ready

      const layersOrder = ctx.uno.config.layers
      globalLayers = ctx.uno.config.preflights
        .map(p => p.layer)
        .filter(notNull)
        .sort((a, b) =>
          layersOrder[a] - layersOrder[b])

      filter = config.content?.pipeline === false
        ? () => false
        : createFilter(
            config.content?.pipeline?.include ?? [/\.vue$/],
            config.content?.pipeline?.exclude ?? defaultPipelineExclude,
          )
    },
    resolveId(id) {
      const entry = resolveId(id)
      if (entry) {
        entries.add(entry)
        return entry
      }
    },
    async load(id) {
      const layer = resolveLayer(getPath(id))
      if (!layer)
        return null

      // Wait for potential concurrent Vue file processing
      await new Promise(resolve => setTimeout(resolve, 50))

      const { css } = await generateCSS(layer)
      if (css) {
        return {
          code: css,
        }
      }
      this.warn(`[unocss] virtual module ${id} was requested but not generated`)
    },
    async transform(code, id) {
      if (!filter(id) || !id.endsWith('.vue'))
        return

      const css = await transformSFC(code, id)

      if (css) {
        return {
          code: css,
          map: null,
        }
      }
    },
    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return await transformSFC(code, ctx.file) || code
        }
      }
    },
    buildStart() {
      entries.clear()
      lastServedHash.clear()
      ctx.tasks.length = 0
    },
    async renderChunk(_code, chunk) {
      if (viteConfig.command !== 'build')
        return null

      const vueModules = Object.entries(chunk.modules).filter(([id]) => filter(id))
      const virtualCSSEntry = resolveId(virtualModuleCSS)

      if (vueModules.length > 0 && virtualCSSEntry && entries.has(virtualCSSEntry)) {
        cssPostPlugin = viteConfig.plugins.find(i => i.name === 'vite:css-post')
        if (!cssPostPlugin) {
          this.warn('[vue-scoped] failed to find vite:css-post plugin. It might be an internal bug of UnoCSS')
          return null
        }

        for (const [moduleId, moduleInfo] of vueModules) {
          if (moduleInfo && typeof moduleInfo.code === 'string') {
            ctx.tasks.push(ctx.extract(moduleInfo.code, moduleId))
          }
        }

        await ctx.flushTasks()

        if (ctx.tokens.size > 0) {
          const { getLayers } = await ctx.uno.generate(ctx.tokens)
          const globalStyles = getLayers(globalLayers)

          if (cssPostPlugin?.transform) {
            const transformHandler = typeof cssPostPlugin.transform === 'object' && 'handler' in cssPostPlugin.transform
              ? cssPostPlugin.transform.handler
              : cssPostPlugin.transform
            await transformHandler.call(this as Rollup.TransformPluginContext, globalStyles, virtualCSSEntry)
          }
        }
      }
    },
  }
}
