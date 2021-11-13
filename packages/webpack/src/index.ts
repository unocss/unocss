import { BetterMap, createGenerator, UserConfigDefaults } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import { createUnplugin, UnpluginOptions, ResolvedUnpluginOptions } from 'unplugin'
import { RawSource } from 'webpack-sources'
import { createFilter } from '@rollup/pluginutils'
import { getPath } from '../../vite/src/utils'
import { defaultInclude, defaultExclude } from '../../plugins-common/defaults'
import { resolveId, ALL_LAYERS, PLACEHOLDER_RE } from '../../plugins-common/layers'
import { PluginOptions } from '../../plugins-common/types'

export interface WebpackPluginOptions extends PluginOptions {}

const name = 'unocss:webpack'

export function defineConfig(config: WebpackPluginOptions) {
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

    const isDev = !!process.env.WEBPACK_DEV_SERVER
    let devInitialized = false

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
      // serve the placeholders in build
      load: isDev
        ? undefined
        : (id) => {
          const layer = entries.get(getPath(id))
          if (layer)
            return `#--unocss--{layer:${layer}}`
        },
      webpack(compiler) {
      // replace the placeholders in build
        if (!isDev) {
          compiler.hooks.compilation.tap(name, (compilation) => {
            compilation.hooks.optimizeAssets.tapPromise(name, async() => {
              const files = Object.keys(compilation.assets)
                .filter(i => i.endsWith('.css'))

              await Promise.all(tasks)
              const result = await uno.generate(tokens, { layerComments: false })

              for (const file of files) {
                let code = compilation.assets[file].source().toString()
                let replaced = false
                code = code.replace(PLACEHOLDER_RE, (_, layer) => {
                  replaced = true
                  return layer === ALL_LAYERS
                    ? result.getLayers(undefined, Array.from(entries.values()))
                    : result.getLayer(layer) || ''
                })
                if (replaced)
                  compilation.assets[file] = new RawSource(code) as any
              }
            })
          })
        }
        // workaround: retrigger file update after the initial bundle finished
        compiler.hooks.done.tap('done', () => {
          if (isDev && !devInitialized) {
            devInitialized = true
            updateModules()
          }
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
      timer = setTimeout(updateModules, 10)
    }

    async function updateModules() {
      if (!plugin.__vfsModules)
        return

      const result = await uno.generate(tokens, { layerComments: false })
      Array.from(plugin.__vfsModules)
        .forEach((id) => {
          const path = id.slice(plugin.__virtualModulePrefix.length)
          const layer = entries.get(path)
          if (!layer)
            return
          const code = layer === ALL_LAYERS
            ? result.getLayers(undefined, Array.from(entries.values()))
            : result.getLayer(layer) || ''
          plugin.__vfs.writeModule(id, code)
        })
    }

    return plugin
  }).webpack()
}
