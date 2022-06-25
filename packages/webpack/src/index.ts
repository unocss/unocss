import type { UserConfig, UserConfigDefaults } from '@unocss/core'
import type { ResolvedUnpluginOptions, UnpluginOptions } from 'unplugin'
import { createUnplugin } from 'unplugin'
import WebpackSources from 'webpack-sources'
import MagicString from 'magic-string'
import {
  HASH_PLACEHOLDER_RE,
  LAYER_MARK_ALL,
  LAYER_PLACEHOLDER_RE,
  createContext,
  getHash,
  getHashPlaceholder,
  getLayerPlaceholder,
  getPath,
  resolveId,
  resolveLayer,
} from '../../shared-integration/src'

export interface WebpackPluginOptions<Theme extends {} = {}> extends UserConfig<Theme> {}

const PLUGIN_NAME = 'unocss:webpack'
const UPDATE_DEBOUNCE = 10

export function defineConfig<Theme extends {}>(config: WebpackPluginOptions<Theme>) {
  return config
}

export default function WebpackPlugin<Theme extends {}>(
  configOrPath?: WebpackPluginOptions<Theme> | string,
  defaults?: UserConfigDefaults,
) {
  return createUnplugin(() => {
    const context = createContext<WebpackPluginOptions>(configOrPath as any, defaults)
    const { uno, tokens, filter, extract, onInvalidate } = context

    let timer: any
    onInvalidate(() => {
      clearTimeout(timer)
      timer = setTimeout(updateModules, UPDATE_DEBOUNCE)
    })

    const tasks: Promise<any>[] = []
    const entries = new Set<string>()
    const hashs = new Map<string, string>()

    const plugin = <UnpluginOptions>{
      name: 'unocss:webpack',
      enforce: 'pre',
      transformInclude(id) {
        return filter('', id)
      },
      async transform(code, id) {
        const result = await transform(code, id)
        if (result === null)
          tasks.push(extract(code, id))
        else
          tasks.push(extract(result.code, id))
        return result
      },
      resolveId(id) {
        const entry = resolveId(id)
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
      // serve the placeholders in virtual module
      load(id) {
        let layer = resolveLayer(getPath(id))
        if (!layer) {
          const entry = resolveId(id)
          if (entry)
            layer = resolveLayer(entry)
        }
        const hash = hashs.get(id)
        if (layer)
          return (hash ? getHashPlaceholder(hash) : '') + getLayerPlaceholder(layer)
      },
      webpack(compiler) {
        // replace the placeholders
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
          compilation.hooks.optimizeAssets.tapPromise(PLUGIN_NAME, async () => {
            const files = Object.keys(compilation.assets)

            await Promise.all(tasks)
            const result = await uno.generate(tokens, { minify: true })

            for (const file of files) {
              let code = compilation.assets[file].source().toString()
              let replaced = false
              code = code.replace(HASH_PLACEHOLDER_RE, '')
              code = code.replace(LAYER_PLACEHOLDER_RE, (_, quote, layer) => {
                replaced = true
                const css = layer === LAYER_MARK_ALL
                  ? result.getLayers(undefined, Array.from(entries)
                    .map(i => resolveLayer(i)).filter((i): i is string => !!i))
                  : result.getLayer(layer) || ''

                if (!quote)
                  return css

                // the css is in a js file, escaping
                let escaped = JSON.stringify(css).slice(1, -1)
                // in `eval()`, escaping twice
                if (quote === '\\"')
                  escaped = JSON.stringify(escaped).slice(1, -1)
                return quote + escaped
              })
              if (replaced)
                compilation.assets[file] = new WebpackSources.RawSource(code) as any
            }
          })
        })
      },
    } as Required<ResolvedUnpluginOptions>

    async function transform(code: string, id: string) {
      const transformers = (context.uno.config.transformers || []).filter(i => i.enforce === plugin.enforce)
      if (!transformers.length)
        return null
      const s = new MagicString(code)
      for (const t of transformers) {
        if (t.idFilter) {
          if (!t.idFilter(id))
            continue
        }
        else if (!context.filter(code, id)) {
          continue
        }
        await t.transform(s, id, context)
      }
      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true, source: id }),
        }
      }
      return null
    }
    async function updateModules() {
      if (!plugin.__vfsModules)
        return

      const result = await uno.generate(tokens)
      Array.from(plugin.__vfsModules)
        .forEach((id) => {
          const path = id.slice(plugin.__virtualModulePrefix.length).replace(/\\/g, '/')
          const layer = resolveLayer(path)
          if (!layer)
            return
          const code = layer === LAYER_MARK_ALL
            ? result.getLayers(undefined, Array.from(entries)
              .map(i => resolveLayer(i)).filter((i): i is string => !!i))
            : result.getLayer(layer) || ''

          const hash = getHash(code)
          hashs.set(path, hash)
          plugin.__vfs.writeModule(id, code)
        })
    }

    return plugin
  }).webpack()
}
