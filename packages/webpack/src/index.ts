import { UserConfigDefaults } from '@unocss/core'
import { createUnplugin, UnpluginOptions, ResolvedUnpluginOptions } from 'unplugin'
import WebpackSources from 'webpack-sources'
import { getPath } from '../../plugins-common/utils'
import { resolveId, LAYER_MARK_ALL, LAYER_PLACEHOLDER_RE, getLayerPlaceholder, PluginConfig, createContext } from '../../plugins-common'

export interface WebpackPluginOptions<Theme extends {} = {}> extends PluginConfig<Theme> {}

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
    const context = createContext(configOrPath, defaults)
    const { uno, tokens, modules, filter } = context

    const tasks: Promise<any>[] = []
    const entries = new Map<string, string>()

    const plugin = <UnpluginOptions>{
      name: 'unocss:webpack',
      enforce: 'pre',
      transformInclude(id) {
        return filter('', id)
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
