import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { Plugin, ResolvedConfig, Rollup } from 'vite'
import type { VitePluginConfig } from '../../types'
import { isAbsolute, resolve } from 'node:path'
import { LAYER_IMPORTS, LAYER_PREFLIGHTS } from '@unocss/core'
import MagicString from 'magic-string'
import { LAYER_MARK_ALL } from '#integration/constants'
import { setupContentExtractor } from '#integration/content'
import { getCssEscaperForJsContent, getLayerPlaceholder, LAYER_PLACEHOLDER_RE, resolveId, resolveLayer } from '#integration/layers'
import { applyTransformers } from '#integration/transformers'
import { getPath } from '#integration/utils'
import { MESSAGE_UNOCSS_ENTRY_NOT_FOUND } from './shared'

export function GlobalModeBuildPlugin(ctx: UnocssPluginContext<VitePluginConfig>): Plugin[] {
  const { ready, extract, tokens, filter, getConfig, tasks, flushTasks } = ctx
  const vfsLayers = new Map<string, string>()
  const resolveContexts = new Map<string, Rollup.PluginContext>()
  const unocssImporters = new Set<string>()
  let viteConfig: ResolvedConfig

  // use maps to differentiate multiple build. using outDir as key
  const cssPostPlugins = new Map<string | undefined, Plugin | undefined>()
  const cssPlugins = new Map<string | undefined, Plugin | undefined>()

  async function applyCssTransform(css: string, id: string, dir: string | undefined, ctx: Rollup.PluginContext) {
    const {
      postcss = true,
    } = await getConfig()
    if (!cssPlugins.get(dir) || !postcss)
      return css
    const cssPlugin = cssPlugins.get(dir)!
    const cssPluginTransformHandler = 'handler' in cssPlugin.transform!
      ? cssPlugin.transform.handler
      : cssPlugin.transform!
    // @ts-expect-error without this context absolute assets will throw an error
    const result = await cssPluginTransformHandler.call(ctx, css, id)
    if (!result)
      return css
    if (typeof result === 'string')
      css = result
    else if (result.code)
      css = result.code.toString()
    css = css.replace(/[\n\r]/g, '')
    return css
  }

  let lastTokenSize = 0
  let lastResult: GenerateResult | undefined
  async function generateAll() {
    await flushTasks()
    if (lastResult && lastTokenSize === tokens.size)
      return lastResult
    lastResult = await ctx.uno.generate(tokens, { minify: true })
    lastTokenSize = tokens.size
    return lastResult
  }

  const cssContentCache = new Map<string, string>()

  return [
    {
      name: 'unocss:global:build:scan',
      apply: 'build',
      enforce: 'pre',
      async buildStart() {
        vfsLayers.clear()
        cssContentCache.clear()
        tasks.length = 0
        lastTokenSize = 0
        lastResult = undefined
      },
      transform(code, id) {
        if (filter(code, id))
          tasks.push(extract(code, id))
        return null
      },
      transformIndexHtml: {
        order: 'pre',
        handler(code, { filename }) {
          tasks.push(extract(code, filename))
        },
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore Compatibility with Legacy Vite
        enforce: 'pre',
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore Compatibility with Legacy Vite
        transform(code, { filename }) {
          tasks.push(extract(code, filename))
        },
      },
      async resolveId(id, importer) {
        const entry = await resolveId(ctx, id, importer)
        if (entry) {
          const layer = await resolveLayer(ctx, entry)
          if (layer) {
            if (importer)
              unocssImporters.add(importer)
            if (vfsLayers.has(layer)) {
              this.warn(`[unocss] ${JSON.stringify(id)} is being imported multiple times in different files, using the first occurrence: ${JSON.stringify(vfsLayers.get(layer))}`)
              return vfsLayers.get(layer)
            }
            vfsLayers.set(layer, entry)
            resolveContexts.set(layer, this)
          }
          return entry
        }
      },
      async load(id) {
        const layer = await resolveLayer(ctx, getPath(id))
        if (layer) {
          if (!vfsLayers.has(layer)) {
            this.error(`[unocss] layer ${JSON.stringify(id)} is imported but not being resolved before, it might be an internal bug of UnoCSS`)
          }
          return {
            code: getLayerPlaceholder(layer),
            map: null,
            moduleSideEffects: true,
          }
        }
      },
      shouldTransformCachedModule({ id }) {
        // Ensure that importers of __uno.css files are never cached, otherwise,
        // in watch mode, resolveId will only be called during the initial build,
        // but vfsLayers is emptied at the beginning of each subsequent build
        // (#4616)
        return unocssImporters.delete(id)
      },
      async configResolved(config) {
        const distDirs = [
          resolve(config.root, config.build.outDir),
        ]

        // for Vite lib more with rollupOptions.output, #2231
        if (config.build.rollupOptions.output) {
          const outputOptions = config.build.rollupOptions.output
          const outputDirs = Array.isArray(outputOptions)
            ? outputOptions.map(option => option.dir).filter(Boolean) as string[]
            : outputOptions.dir
              ? [outputOptions.dir]
              : []

          outputDirs.forEach((dir) => {
            distDirs.push(dir)

            if (!isAbsolute(dir))
              distDirs.push(resolve(config.root, dir))
          })
        }

        // for Vite 8's Environment API, each environment may have its own build.outDir.
        // configResolved may run once per environment config (each with its own
        // vite:css/vite:css-post instances), so other environments' dirs must not
        // override an entry already claimed by that environment's own config (#5329)
        const envDirs: string[] = []
        for (const env of Object.values(config.environments ?? {})) {
          if (env?.build?.outDir)
            envDirs.push(resolve(config.root, env.build.outDir))
        }

        const cssPostPlugin = config.plugins.find(i => i.name === 'vite:css-post') as Plugin | undefined
        const cssPlugin = config.plugins.find(i => i.name === 'vite:css') as Plugin | undefined

        if (cssPostPlugin) {
          distDirs.forEach(dir => cssPostPlugins.set(dir, cssPostPlugin))
          envDirs.forEach(dir => cssPostPlugins.has(dir) || cssPostPlugins.set(dir, cssPostPlugin))
        }

        if (cssPlugin) {
          distDirs.forEach(dir => cssPlugins.set(dir, cssPlugin))
          envDirs.forEach(dir => cssPlugins.has(dir) || cssPlugins.set(dir, cssPlugin))
        }

        await ready
      },
    },
    {
      name: 'unocss:global:content',
      enforce: 'pre',
      configResolved(config) {
        viteConfig = config
      },
      buildStart() {
        tasks.push(setupContentExtractor(ctx, viteConfig.mode !== 'test' && viteConfig.command === 'serve'))
      },
    },
    {
      name: 'unocss:global:build:generate',
      apply: 'build',
      async renderChunk(code, chunk, options) {
        const { RESOLVED_ID_RE } = await ctx.getVMPRegexes()
        const entryModules = Object.keys(chunk.modules).filter(id => RESOLVED_ID_RE.test(getPath(id)))
        // `?inline` bakes the layer placeholder into JS before css-post can replace it (#4884)
        const hasLayerPlaceholder = code.includes('#--unocss--')
        if (!entryModules.length && !hasLayerPlaceholder)
          return null

        const result = await generateAll()
        const fakeCssId = `${viteConfig.root}/${chunk.fileName}-unocss-hash.css`
        const preflightLayers = ctx.uno.config.preflights?.map(i => i.layer).concat(LAYER_PREFLIGHTS).filter(Boolean)

        await Promise.all(preflightLayers.map(i => result.setLayer(i!, async (layerContent) => {
          const preTransform = await applyTransformers(ctx, layerContent, fakeCssId, 'pre')
          const defaultTransform = await applyTransformers(ctx, preTransform?.code || layerContent, fakeCssId)
          const postTransform = await applyTransformers(ctx, defaultTransform?.code || preTransform?.code || layerContent, fakeCssId, 'post')
          return postTransform?.code || defaultTransform?.code || preTransform?.code || layerContent
        })))

        if (entryModules.length) {
          const cssPost = cssPostPlugins.get(options.dir)
          if (!cssPost) {
            this.warn('[unocss] failed to find vite:css-post plugin. It might be an internal bug of UnoCSS')
          }
          else {
            const cssPostTransformHandler = 'handler' in cssPost.transform!
              ? cssPost.transform.handler
              : cssPost.transform!

            for (const mod of entryModules) {
              const layer = RESOLVED_ID_RE.exec(getPath(mod))?.[1] || LAYER_MARK_ALL

              const layerContent = layer === LAYER_MARK_ALL
                ? result.getLayers(undefined, [LAYER_IMPORTS, ...vfsLayers.keys()])
                : result.getLayer(layer) || ''

              const css = await applyCssTransform(
                layerContent,
                mod,
                options.dir,
                // .emitFile in Rollup has different FileEmitter instance in load/transform hooks and renderChunk hooks
                // here we need to store the resolveId context to use it in the vite:css transform hook
                resolveContexts.get(layer) || this,
              )

              // Fool the vite:css-post plugin to replace the CSS content
              await cssPostTransformHandler.call(this as Rollup.TransformPluginContext, css, mod)
            }
          }
        }

        if (!hasLayerPlaceholder)
          return null

        const s = new MagicString(code)
        LAYER_PLACEHOLDER_RE.lastIndex = 0
        for (const match of code.matchAll(LAYER_PLACEHOLDER_RE)) {
          const [full, layer, escapeView] = match
          const layerName = layer.trim()
          const layerContent = layerName === LAYER_MARK_ALL
            ? result.getLayers(undefined, [LAYER_IMPORTS, ...vfsLayers.keys()])
            : result.getLayer(layerName) || ''
          const css = getCssEscaperForJsContent((escapeView || '').trim())(layerContent)
          s.overwrite(match.index!, match.index! + full.length, css)
        }

        if (!s.hasChanged())
          return null

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true }),
        }
      },
      async buildEnd() {
        if (!vfsLayers.size) {
          if ((await getConfig() as VitePluginConfig).checkImport) {
            this.warn(MESSAGE_UNOCSS_ENTRY_NOT_FOUND)
          }
        }
      },
    },
  ]
}
