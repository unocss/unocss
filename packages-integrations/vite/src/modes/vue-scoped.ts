import type { UnocssPluginContext } from '@unocss/core'
import type { ModuleNode, Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { VitePluginConfig } from '../types'
import { LAYER_PREFLIGHTS } from '@unocss/core'
import { createFilter } from 'unplugin-utils'
import { defaultPipelineExclude } from '#integration/defaults'
import { getHash } from '#integration/hash'
import { fromViteVirtualId, toViteClientPath, toViteVirtualId } from '../virtual'

const GLOBAL_LAYER_ORDER_ID = 'virtual:unocss-vue-scoped-layers.css'
const GLOBAL_LAYER_ORDER_RESOLVED_ID = toViteVirtualId(GLOBAL_LAYER_ORDER_ID)
const DEV_GLOBAL_STYLES_ID = 'virtual:unocss-vue-scoped-global.css'
const DEV_GLOBAL_STYLES_RESOLVED_ID = toViteVirtualId(DEV_GLOBAL_STYLES_ID)
const SCOPED_STYLE_PREFIX = 'virtual:unocss-vue-scoped-sfc/'
const SCOPED_STYLE_RESOLVED_PREFIX = toViteVirtualId(SCOPED_STYLE_PREFIX)

interface ScopedStyleEntry {
  css: string
  hash: string
}

export function VueScopedPlugin(ctx: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.vue$/], defaultPipelineExclude)
  let globalLayers: string[] = []
  let globalStylesInjected = false
  let styleOrder: 'before' | 'after' = 'after'
  let isServe = false

  const servers: ViteDevServer[] = []
  let globalStylesLoaded = false
  let globalStylesHash = ''
  let globalUpdateTimer: ReturnType<typeof setTimeout> | undefined

  const scopedStyles = new Map<string, ScopedStyleEntry>()
  const pendingScopedStyleUpdates = new Set<string>()
  let scopedStyleUpdateTimer: ReturnType<typeof setTimeout> | undefined

  function sortLayerNames(names: string[]) {
    const { layers, sortLayers } = ctx.uno.config
    return sortLayers(names.sort((a, b) => (layers[a] ?? 0) - (layers[b] ?? 0) || a.localeCompare(b)))
  }

  function resolveGlobalLayers() {
    const { preflights } = ctx.uno.config
    return sortLayerNames([...new Set((preflights ?? [])
      .map(p => p.layer ?? LAYER_PREFLIGHTS))])
  }

  // Declare the full layer order up front. Each generated SFC otherwise emits
  // its own `@layer` statement containing only the layers it uses, so the
  // first component that happens to use `default` would register it before
  // `shortcuts` and reverse the order configured by the project.
  function resolveLayerOrder() {
    const { layers, outputToCssLayers } = ctx.uno.config
    if (!outputToCssLayers)
      return ''
    const aliases = sortLayerNames(Object.keys(layers))
      .map((layer) => {
        const alias = typeof outputToCssLayers === 'object'
          ? outputToCssLayers.cssLayerName?.(layer)
          : layer
        return alias === null ? null : alias ?? layer
      })
      .filter((layer): layer is string => !!layer)
    return aliases.length
      ? `@layer ${aliases.join(', ')};`
      : ''
  }

  async function generateGlobalStyles() {
    const layerOrder = resolveLayerOrder()
    if (!globalLayers.length)
      return layerOrder

    await ctx.flushTasks()
    const { getLayers } = await ctx.uno.generate(ctx.tokens)
    return [layerOrder, getLayers(globalLayers)].filter(Boolean).join('\n')
  }

  function sendDevUpdate(server: ViteDevServer, module: ModuleNode) {
    const timestamp = Date.now()
    const paths = [...new Set([module.url, toViteClientPath(module.url)])]
    server.ws.send({
      type: 'update',
      updates: paths.map(path => ({
        acceptedPath: path,
        path,
        timestamp,
        type: 'js-update',
      })),
    })
  }

  async function updateGlobalStyles() {
    if (!isServe || !globalStylesLoaded)
      return

    const css = await generateGlobalStyles()
    const hash = getHash(css)
    if (hash === globalStylesHash)
      return

    globalStylesHash = hash
    for (const server of servers) {
      const module = server.moduleGraph.getModuleById(DEV_GLOBAL_STYLES_RESOLVED_ID)
      if (!module)
        continue
      server.moduleGraph.invalidateModule(module)
      sendDevUpdate(server, module)
    }
  }

  function scheduleScopedStyleUpdate(styleId: string) {
    pendingScopedStyleUpdates.add(styleId)
    if (scopedStyleUpdateTimer)
      return
    scopedStyleUpdateTimer = setTimeout(() => {
      scopedStyleUpdateTimer = undefined
      const styleIds = [...pendingScopedStyleUpdates]
      pendingScopedStyleUpdates.clear()
      for (const styleId of styleIds)
        updateScopedStyleModules(styleId)
    }, 10)
  }

  function updateScopedStyleModules(styleId: string) {
    const marker = toViteVirtualId(styleId)
    for (const server of servers) {
      for (const [id, module] of server.moduleGraph.idToModuleMap) {
        if (!id.startsWith(marker) || !id.includes('type=style'))
          continue
        server.moduleGraph.invalidateModule(module)
        sendDevUpdate(server, module)
      }
    }
  }

  // All global layers are served as a single virtual CSS module in dev, so an
  // HMR update only fetches one stylesheet instead of one per layer.
  ctx.onInvalidate(() => {
    if (!isServe || !globalStylesLoaded)
      return
    clearTimeout(globalUpdateTimer)
    globalUpdateTimer = setTimeout(() => {
      void updateGlobalStyles()
    }, 10)
  })

  ctx.onReload(() => {
    globalLayers = resolveGlobalLayers()
  })

  async function transformSFC(code: string, id: string) {
    await ctx.ready
    // Keep the shared token set in sync so that the global preflight layers
    // (e.g. on-demand theme variables) can be generated from every SFC.
    ctx.tasks.push(ctx.extract(code, id))
    const { getLayers } = await ctx.uno.generate(code)
    const styleId = `${SCOPED_STYLE_PREFIX}${getHash(id, 12)}.css`
    const css = getLayers(undefined, globalLayers)
    const hash = getHash(css)
    const previous = scopedStyles.get(styleId)
    scopedStyles.set(styleId, { css, hash })

    if (isServe && previous && previous.hash !== hash)
      scheduleScopedStyleUpdate(styleId)

    // Keep the style block itself stable: its content lives in the virtual
    // module above, so editing an SFC never changes the block's content.
    const styleBlock = `<style scoped src="${styleId}"></style>`
    return styleOrder === 'before'
      ? `${styleBlock}\n${code}`
      : `${code}\n${styleBlock}`
  }

  return {
    name: 'unocss:vue-scoped',
    enforce: 'pre',
    configureServer(server) {
      servers.push(server)
    },
    async configResolved(viteConfig: ResolvedConfig) {
      const { config } = await ctx.ready
      isServe = viteConfig.command === 'serve'
      styleOrder = (config as VitePluginConfig).vueScoped?.styleOrder ?? 'after'

      // Preflight layers (CSS variables, reset, `@property`, ...) are global
      // by nature. Vue's scoped CSS transform would rewrite their selectors
      // (`:root` -> `[data-v-xxx]:root`) making them unreachable, so they are
      // served as shared, unscoped CSS modules instead (#4825).
      globalLayers = resolveGlobalLayers()

      filter = config.content?.pipeline === false
        ? () => false
        : createFilter(
            config.content?.pipeline?.include ?? [/\.vue$/],
            config.content?.pipeline?.exclude ?? defaultPipelineExclude,
          )
    },
    transformIndexHtml: {
      order: 'pre',
      handler() {
        if (isServe) {
          if (!globalLayers.length && !resolveLayerOrder())
            return
          return [{
            tag: 'script',
            attrs: { type: 'module' },
            children: `import ${JSON.stringify(DEV_GLOBAL_STYLES_ID)};`,
            injectTo: 'head',
          }]
        }

        const imports = [
          resolveLayerOrder() && JSON.stringify(GLOBAL_LAYER_ORDER_ID),
          ...globalLayers.map(layer => JSON.stringify(`uno:${layer}.css`)),
        ].filter(Boolean)
        if (!imports.length)
          return
        return [{
          tag: 'script',
          attrs: { type: 'module' },
          children: imports
            .map(id => `import ${id};`)
            .join(''),
          injectTo: 'head',
        }]
      },
    },
    resolveId(id) {
      if (id.startsWith(SCOPED_STYLE_PREFIX))
        return toViteVirtualId(id)
      if (id === DEV_GLOBAL_STYLES_ID)
        return DEV_GLOBAL_STYLES_RESOLVED_ID
      if (id === GLOBAL_LAYER_ORDER_ID) {
        globalStylesInjected = true
        return GLOBAL_LAYER_ORDER_RESOLVED_ID
      }
      if (/^uno:[^?]+\.css(?:\?|$)/.test(id))
        globalStylesInjected = true
    },
    async load(id) {
      if (id.startsWith(SCOPED_STYLE_RESOLVED_PREFIX)) {
        const styleId = fromViteVirtualId(id).split('?')[0]
        return scopedStyles.get(styleId)?.css ?? ''
      }
      if (id === DEV_GLOBAL_STYLES_RESOLVED_ID) {
        await ctx.ready
        const css = await generateGlobalStyles()
        globalStylesLoaded = true
        globalStylesHash = getHash(css)
        return css
      }
      if (id === GLOBAL_LAYER_ORDER_RESOLVED_ID) {
        await ctx.ready
        return resolveLayerOrder()
      }
    },
    generateBundle: {
      order: 'post',
      async handler(_options, bundle) {
        // Library/SSR builds have no HTML entry (or don't load the imports
        // injected by `transformIndexHtml`), so prepend the global preflight
        // layers to the emitted CSS instead.
        if (globalStylesInjected)
          return

        const styles = await generateGlobalStyles()
        if (!styles)
          return

        for (const file of Object.values(bundle)) {
          if (file.type !== 'asset' || !file.fileName.endsWith('.css'))
            continue
          const source = typeof file.source === 'string'
            ? file.source
            : new TextDecoder().decode(file.source)
          file.source = `${styles}\n${source}`
        }
      },
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
  }
}
