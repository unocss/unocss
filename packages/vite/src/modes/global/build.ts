import { resolve } from 'path'
import type { Plugin, ResolvedConfig } from 'vite'
import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { PluginContext } from 'rollup'
import {
  HASH_PLACEHOLDER_RE, LAYER_MARK_ALL, LAYER_PLACEHOLDER_RE,
  RESOLVED_ID_RE,
  getHash,
  getHashPlaceholder,
  getLayerPlaceholder,
  getPath,
  replaceAsync,
  resolveId,
  resolveLayer,
} from '../../integration'
import type { VitePluginConfig } from '../../types'
import { setupExtraContent } from '../../../../shared-integration/src/extra-content'

export function GlobalModeBuildPlugin(ctx: UnocssPluginContext<VitePluginConfig>): Plugin[] {
  const { uno, ready, extract, tokens, filter, getConfig, tasks, flushTasks } = ctx
  const vfsLayers = new Set<string>()
  const layerImporterMap = new Map<string, string>()
  let viteConfig: ResolvedConfig

  // use maps to differentiate multiple build. using outDir as key
  const cssPostPlugins = new Map<string | undefined, Plugin | undefined>()
  const cssPlugins = new Map<string | undefined, Plugin | undefined>()

  async function applyCssTransform(css: string, id: string, dir: string | undefined, ctx: PluginContext) {
    const {
      postcss = true,
    } = await getConfig()
    if (!cssPlugins.get(dir) || !postcss)
      return css
    // @ts-expect-error without this context absolute assets will throw an error
    const result = await cssPlugins.get(dir).transform.call(ctx, css, id)
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
    lastResult = await uno.generate(tokens, { minify: true })
    lastTokenSize = tokens.size
    return lastResult
  }

  let replaced = false

  return [
    {
      name: 'unocss:global:build:scan',
      apply: 'build',
      enforce: 'pre',
      async buildStart() {
        vfsLayers.clear()
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
        enforce: 'pre',
        transform(code, { filename }) {
          tasks.push(extract(code, filename))
        },
      },
      resolveId(id, importer) {
        const entry = resolveId(id)
        if (entry) {
          const layer = resolveLayer(entry)
          if (layer) {
            vfsLayers.add(layer)
            if (importer)
              layerImporterMap.set(importer, entry)
          }
          return entry
        }
      },
      load(id) {
        const layer = resolveLayer(getPath(id))
        if (layer) {
          vfsLayers.add(layer)
          return getLayerPlaceholder(layer)
        }
      },
      moduleParsed({ id, importedIds }) {
        if (!layerImporterMap.has(id))
          return

        const layerKey = layerImporterMap.get(id)!
        if (!importedIds.includes(layerKey)) {
          layerImporterMap.delete(id)
          vfsLayers.delete(resolveLayer(layerKey)!)
        }
      },
      async configResolved(config) {
        const distDir = resolve(config.root, config.build.outDir)
        cssPostPlugins.set(distDir, config.plugins.find(i => i.name === 'vite:css-post'))
        cssPlugins.set(distDir, config.plugins.find(i => i.name === 'vite:css'))
        await ready
      },
      // we inject a hash to chunk before the dist hash calculation to make sure
      // the hash is different when unocss changes
      async renderChunk(_, chunk, options) {
        // skip hash generation on non-entry chunk
        if (!Object.keys(chunk.modules).some(i => i.match(RESOLVED_ID_RE)))
          return null

        const cssPost = cssPostPlugins.get(options.dir)
        if (!cssPost) {
          this.warn('[unocss] failed to find vite:css-post plugin. It might be an internal bug of UnoCSS')
          return null
        }

        let { css } = await generateAll()
        const fakeCssId = `${chunk.fileName}-unocss-hash.css`
        css = await applyCssTransform(css, fakeCssId, options.dir, this)

        const hash = getHash(css)
        const transformHandler = 'handler' in cssPost.transform!
          ? cssPost.transform.handler
          : cssPost.transform!
        await transformHandler.call({} as any, getHashPlaceholder(hash), fakeCssId)

        // fool the css plugin to generate the css in corresponding chunk
        chunk.modules[fakeCssId] = {
          code: null,
          originalLength: 0,
          removedExports: [],
          renderedExports: [],
          renderedLength: 0,
        }

        return null
      },
    },
    {
      name: 'unocss:global:content',
      enforce: 'pre',
      configResolved(config) {
        viteConfig = config
      },
      buildStart() {
        tasks.push(setupExtraContent(ctx, viteConfig.command === 'serve'))
      },
    },
    {
      name: 'unocss:global:build:generate',
      apply: 'build',
      async renderChunk(code, chunk, options) {
        if (!Object.keys(chunk.modules).some(i => i.match(RESOLVED_ID_RE)))
          return null

        const cssPost = cssPostPlugins.get(options.dir)
        if (!cssPost) {
          this.warn('[unocss] failed to find vite:css-post plugin. It might be an internal bug of UnoCSS')
          return null
        }
        const result = await generateAll()
        const cssWithLayers = Array.from(vfsLayers).map(layer =>
          `#--unocss-layer-start--${layer}--{start:${layer}} ${
            layer === LAYER_MARK_ALL
            ? result.getLayers(undefined, Array.from(vfsLayers))
            : (result.getLayer(layer) || '')
          } #--unocss-layer-end--${layer}--{end:${layer}}`,
        ).join('')

        const fakeCssId = `${chunk.fileName}-unocss-hash.css`
        const css = await applyCssTransform(cssWithLayers, fakeCssId, options.dir, this)
        const transformHandler = 'handler' in cssPost.transform!
          ? cssPost.transform.handler
          : cssPost.transform!
        await transformHandler.call({} as unknown as any, css, fakeCssId)
      },
    },
    {
      name: 'unocss:global:build:bundle',
      apply: 'build',
      enforce: 'post',
      // rewrite the css placeholders
      async generateBundle(options, bundle) {
        const checkJs = ['umd', 'amd', 'iife'].includes(options.format)
        const files = Object.keys(bundle)
          .filter(i => i.endsWith('.css') || (checkJs && i.endsWith('.js')))

        if (!files.length)
          return

        if (!vfsLayers.size) {
          // If `vfsLayers` is empty and `replaced` is true, that means
          // `generateBundle` hook is called on previous build pipeline. e.g. ssr
          // Since we already replaced the layers and don't have any more layers
          // to replace on current build pipeline, we can skip the warning.
          if (replaced)
            return
          const msg = '[unocss] entry module not found, have you add `import \'uno.css\'` in your main entry?'
          this.warn(msg)
          return
        }

        const getLayer = (layer: string, input: string, replace = false) => {
          const re = new RegExp(`#--unocss-layer-start--${layer}--\\{start:${layer}\\}([\\s\\S]*?)#--unocss-layer-end--${layer}--\\{end:${layer}\\}`, 'g')
          if (replace)
            return input.replace(re, '')

          const match = re.exec(input)
          if (match)
            return match[1]
          return ''
        }

        for (const file of files) {
          const chunk = bundle[file]
          if (chunk.type === 'asset' && typeof chunk.source === 'string') {
            const css = chunk.source
              .replace(HASH_PLACEHOLDER_RE, '')
            chunk.source = await replaceAsync(css, LAYER_PLACEHOLDER_RE, async (_, __, layer) => {
              replaced = true
              return getLayer(layer, css)
            })
            Array.from(vfsLayers).forEach((layer) => {
              chunk.source = getLayer(layer, chunk.source as string, true)
            })
          }
          else if (chunk.type === 'chunk' && typeof chunk.code === 'string') {
            const js = chunk.code
              .replace(HASH_PLACEHOLDER_RE, '')
            chunk.code = await replaceAsync(js, LAYER_PLACEHOLDER_RE, async (_, __, layer) => {
              replaced = true
              const css = getLayer(layer, js)
              return css
                .replace(/\n/g, '')
                .replace(/(?<!\\)(['"])/g, '\\$1')
            })
            Array.from(vfsLayers).forEach((layer) => {
              chunk.code = getLayer(layer, chunk.code, true)
            })
          }
        }

        if (!replaced) {
          let msg = '[unocss] does not found CSS placeholder in the generated chunks'
          if (viteConfig.build.lib && checkJs)
            msg += '\nIt seems you are building in library mode, it\'s recommended to set `build.cssCodeSplit` to true.\nSee https://github.com/vitejs/vite/issues/1579'
          else
            msg += '\nThis is likely an internal bug of unocss vite plugin'
          this.error(msg)
        }
      },
    },
  ]
}
