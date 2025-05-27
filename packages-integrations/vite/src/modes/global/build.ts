import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { Plugin, ResolvedConfig, Rollup } from 'vite'
import type { VitePluginConfig } from '../../types'
import { isAbsolute, resolve } from 'node:path'
import { LAYER_MARK_ALL, RESOLVED_ID_RE } from '#integration/constants'
import { setupContentExtractor } from '#integration/content'
import { getLayerPlaceholder, resolveId, resolveLayer } from '#integration/layers'
import { applyTransformers } from '#integration/transformers'
import { getPath } from '#integration/utils'
import { LAYER_IMPORTS, LAYER_PREFLIGHTS } from '@unocss/core'
import { MESSAGE_UNOCSS_ENTRY_NOT_FOUND } from './shared'

export function GlobalModeBuildPlugin(ctx: UnocssPluginContext<VitePluginConfig>): Plugin[] {
  const { ready, extract, tokens, filter, getConfig, tasks, flushTasks } = ctx
  const vfsLayers = new Map<string, string>()
  const resolveContexts = new Map<string, Rollup.PluginContext>()
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
      css = result.code
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
      resolveId(id, importer) {
        const entry = resolveId(id, importer)
        if (entry) {
          const layer = resolveLayer(entry)
          if (layer) {
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
      load(id) {
        const layer = resolveLayer(getPath(id))
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

        const cssPostPlugin = config.plugins.find(i => i.name === 'vite:css-post') as Plugin | undefined
        const cssPlugin = config.plugins.find(i => i.name === 'vite:css') as Plugin | undefined

        if (cssPostPlugin)
          distDirs.forEach(dir => cssPostPlugins.set(dir, cssPostPlugin))

        if (cssPlugin)
          distDirs.forEach(dir => cssPlugins.set(dir, cssPlugin))

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
        const entryModules = Object.keys(chunk.modules).filter(id => RESOLVED_ID_RE.test(id))
        if (!entryModules.length)
          return null

        const cssPost = cssPostPlugins.get(options.dir)
        if (!cssPost) {
          this.warn('[unocss] failed to find vite:css-post plugin. It might be an internal bug of UnoCSS')
          return null
        }
        const cssPostTransformHandler = 'handler' in cssPost.transform!
          ? cssPost.transform.handler
          : cssPost.transform!

        const result = await generateAll()
        const fakeCssId = `${viteConfig.root}/${chunk.fileName}-unocss-hash.css`
        const preflightLayers = ctx.uno.config.preflights?.map(i => i.layer).concat(LAYER_PREFLIGHTS).filter(Boolean)

        await Promise.all(preflightLayers.map(i => result.setLayer(i!, async (layerContent) => {
          const preTransform = await applyTransformers(ctx, layerContent, fakeCssId, 'pre')
          const defaultTransform = await applyTransformers(ctx, preTransform?.code || layerContent, fakeCssId)
          const postTransform = await applyTransformers(ctx, defaultTransform?.code || preTransform?.code || layerContent, fakeCssId, 'post')
          return postTransform?.code || defaultTransform?.code || preTransform?.code || layerContent
        })))

        for (const mod of entryModules) {
          const layer = RESOLVED_ID_RE.exec(mod)?.[1] || LAYER_MARK_ALL

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
