import type { UserConfigDefaults } from '@unocss/core'
import type { ResolvedUnpluginOptions, UnpluginOptions } from 'unplugin'
import type { WebpackPluginOptions } from '.'
import { isAbsolute, normalize } from 'node:path'
import process from 'node:process'
import { LAYER_MARK_ALL, RESOLVED_ID_RE } from '#integration/constants'
import { setupContentExtractor } from '#integration/content'
import { createContext } from '#integration/context'
import { getHash } from '#integration/hash'
import {
  getCssEscaperForJsContent,
  getHashPlaceholder,
  getLayerPlaceholder,
  HASH_PLACEHOLDER_RE,
  LAYER_PLACEHOLDER_RE,
  resolveId,
  resolveLayer,
} from '#integration/layers'
import { applyTransformers } from '#integration/transformers'
import { getPath, isCssId } from '#integration/utils'
import { createUnplugin } from 'unplugin'
import WebpackSources from 'webpack-sources'

const PLUGIN_NAME = 'unocss:webpack'
const UPDATE_DEBOUNCE = 10

export function unplugin<Theme extends object>(configOrPath?: WebpackPluginOptions<Theme> | string, defaults?: UserConfigDefaults) {
  return createUnplugin(() => {
    const ctx = createContext<WebpackPluginOptions>(configOrPath as any, {
      envMode: process.env.NODE_ENV === 'development' ? 'dev' : 'build',
      ...defaults,
    })
    const { tokens, filter, extract, onInvalidate, tasks, flushTasks } = ctx

    let timer: ReturnType<typeof setTimeout>
    onInvalidate(() => {
      clearTimeout(timer)
      timer = setTimeout(updateModules, UPDATE_DEBOUNCE)
    })

    // TODO: detect webpack's watch mode and enable watcher
    tasks.push(setupContentExtractor(ctx, typeof configOrPath === 'object' && configOrPath?.watch))

    const entries = new Set<string>()
    const hashes = new Map<string, string>()

    const plugin = {
      name: 'unocss:webpack',
      enforce: 'pre',
      transformInclude(id) {
        return filter('', id) && !id.endsWith('.html') && !RESOLVED_ID_RE.test(id)
      },
      async transform(code, id) {
        const result = await applyTransformers(ctx, code, id, 'pre')
        if (isCssId(id))
          return result
        if (result == null)
          tasks.push(extract(code, id))
        else
          tasks.push(extract(result.code, id))
        return result
      },
      resolveId(id) {
        const entry = resolveId(id)
        if (entry === id)
          return
        if (entry) {
          let query = ''
          const queryIndex = id.indexOf('?')
          if (queryIndex >= 0)
            query = id.slice(queryIndex)
          entries.add(entry)
          // preserve the input query
          return entry + query
        }
      },
      loadInclude(id) {
        const layer = getLayer(id)
        return !!layer
      },
      // serve the placeholders in virtual module
      load(id) {
        const layer = getLayer(id)
        const hash = hashes.get(id)
        if (layer)
          return (hash ? getHashPlaceholder(hash) : '') + getLayerPlaceholder(layer)
      },
      webpack(compiler) {
        compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async () => {
          await ctx.ready

          const nonPreTransformers = ctx.uno.config.transformers?.filter(i => i.enforce !== 'pre')
          if (nonPreTransformers?.length) {
            console.warn(
              // eslint-disable-next-line prefer-template
              '[unocss] webpack integration only supports "pre" enforce transformers currently.'
              + 'the following transformers will be ignored\n'
              + nonPreTransformers.map(i => ` - ${i.name}`).join('\n'),
            )
          }
        })
        // replace the placeholders
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
          const optimizeAssetsHook = compilation.hooks.processAssets /* webpack 5 & 6 */
            || compilation.hooks.optimizeAssets /* webpack 4 */

          optimizeAssetsHook.tapPromise(PLUGIN_NAME, async () => {
            await ctx.ready
            const files = Object.keys(compilation.assets)

            await flushTasks()
            const result = await ctx.uno.generate(tokens, { minify: true })

            for (const file of files) {
              // https://github.com/unocss/unocss/pull/1428
              if (file === '*')
                return

              let code = compilation.assets[file].source().toString()
              let escapeCss: ReturnType<typeof getCssEscaperForJsContent>
              let replaced = false
              code = code.replace(HASH_PLACEHOLDER_RE, '')
              code = code.replace(LAYER_PLACEHOLDER_RE, (_, layer, escapeView) => {
                replaced = true
                const css = layer.trim() === LAYER_MARK_ALL
                  ? result.getLayers(undefined, Array.from(entries)
                      .map(i => resolveLayer(i)).filter((i): i is string => !!i))
                  : (result.getLayer(layer) || '')

                escapeCss = escapeCss ?? getCssEscaperForJsContent(escapeView.trim())

                return escapeCss(css)
              })
              if (replaced)
                compilation.assets[file] = new WebpackSources.SourceMapSource(code, file, compilation.assets[file].map() as any) as any
            }
          })
        })
      },
      get rspack() {
        return this.webpack
      },
    } as UnpluginOptions as Required<ResolvedUnpluginOptions>

    let lastTokenSize = tokens.size
    async function updateModules() {
      if (!plugin.__vfsModules)
        return

      await flushTasks()
      const result = await ctx.uno.generate(tokens)
      if (lastTokenSize === tokens.size)
        return

      lastTokenSize = tokens.size
      let virtualModules
      if (plugin.__vfsModules instanceof Map) {
        virtualModules = Array.from(plugin.__vfsModules.keys())
      }
      else {
        virtualModules = Array.from(plugin.__vfsModules)
      }

      virtualModules
        .forEach((id) => {
          let path = decodeURIComponent(id.startsWith(plugin.__virtualModulePrefix) ? id.slice(plugin.__virtualModulePrefix.length) : id)
          // unplugin changes the id in the `load` hook, follow it
          // https://github.com/unjs/unplugin/pull/145/files#diff-2b106437404a793ee5b8f3823344656ce880f698d3d8cb6a7cf785e36fb4bf5cR27
          path = normalizeAbsolutePath(path)
          const layer = resolveLayer(path)
          if (!layer)
            return
          const code = layer === LAYER_MARK_ALL
            ? result.getLayers(undefined, Array.from(entries)
                .map(i => resolveLayer(i)).filter((i): i is string => !!i))
            : (result.getLayer(layer) || '')

          const hash = getHash(code)
          hashes.set(path, hash)
          plugin.__vfs.writeModule(id, code)
        })
    }

    return plugin
  })
}

function getLayer(id: string) {
  let layer = resolveLayer(getPath(id))
  if (!layer) {
    const entry = resolveId(id)
    if (entry)
      layer = resolveLayer(entry)
  }
  return layer
}

// https://github.com/unjs/unplugin/pull/145/files#diff-39b2554fd18da165b59a6351b1aafff3714e2a80c1435f2de9706355b4d32351R13-R19
function normalizeAbsolutePath(path: string) {
  if (isAbsolute(path))
    return normalize(path)
  else
    return path
}
