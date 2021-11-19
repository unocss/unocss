import { BetterMap, createGenerator, UserConfigDefaults } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import { createUnplugin, UnpluginOptions, ResolvedUnpluginOptions } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import WebpackSources from 'webpack-sources'
import { getPath } from '../../vite/src/utils'
import { defaultInclude, defaultExclude } from '../../plugins-common/defaults'
import { resolveId, LAYER_MARK_ALL, LAYER_PLACEHOLDER_RE, getLayerPlaceholder } from '../../plugins-common/layers'
import { PluginOptions } from '../../plugins-common/types'

export interface WebpackPluginOptions<Theme extends {} = {}> extends PluginOptions<Theme> {}

const PLUGIN_NAME = 'unocss:webpack'
const UPDATE_DEBOUNCE = 10

export function defineConfig<Theme extends {}>(config: WebpackPluginOptions<Theme>) {
  return config
}

export default function WebpackPlugin(
  configOrPath?: WebpackPluginOptions | string,
  defaults?: UserConfigDefaults,
) {
  return createUnplugin(() => {
    const { config = {} } = loadConfig(configOrPath)

    const filter = createFilter(
      config.include || defaultInclude,
      config.exclude || defaultExclude,
    )

    const uno = createGenerator(config, defaults)

    const modules = new BetterMap<string, string>()
    const tokens = new Set<string>()
    const tasks: Promise<any>[] = []
    const entries = new Map<string, string>()

    const plugin = <UnpluginOptions>{
      name: 'unocss:webpack',
      enforce: 'pre',
      transformInclude(id) {
        return filter(id)
      },
      transform(code, id) {
        tasks.push(scan(code, id))
        return null
      },
      resolveId(id) {
        const entry = resolveId(id)
        if (entry) {
          entries.set(entry.id, entry.layer)
          entries.set(id, entry.layer)
          return entry.id
        }
      },
      // serve the placeholders in virtual module
      load(id) {
        const layer = entries.get(getPath(id))
        if (layer)
          return getLayerPlaceholder(layer)
      },
      webpack(compiler) {
        // replace the placeholders
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
          compilation.hooks.optimizeAssets.tapPromise(PLUGIN_NAME, async() => {
            const files = Object.keys(compilation.assets)

            await Promise.all(tasks)
            const result = await uno.generate(tokens, { minify: true })

            for (const file of files) {
              let code = compilation.assets[file].source().toString()
              let replaced = false
              code = code.replace(LAYER_PLACEHOLDER_RE, (_, quote, layer) => {
                replaced = true
                const css = layer === LAYER_MARK_ALL
                  ? result.getLayers(undefined, Array.from(entries.values()))
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

    async function scan(code: string, id?: string) {
      if (id)
        modules.set(id, code)
      await uno.applyExtractors(code, id, tokens)
      scheduleUpdate()
    }

    let timer: any
    function scheduleUpdate() {
      clearTimeout(timer)
      timer = setTimeout(updateModules, UPDATE_DEBOUNCE)
    }

    async function updateModules() {
      if (!plugin.__vfsModules)
        return

      const result = await uno.generate(tokens)
      Array.from(plugin.__vfsModules)
        .forEach((id) => {
          const path = id.slice(plugin.__virtualModulePrefix.length)
          const layer = entries.get(path)
          if (!layer)
            return
          const code = layer === LAYER_MARK_ALL
            ? result.getLayers(undefined, Array.from(entries.values()))
            : result.getLayer(layer) || ''
          plugin.__vfs.writeModule(id, code)
        })
    }

    return plugin
  }).webpack()
}
