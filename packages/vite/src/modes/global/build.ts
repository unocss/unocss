import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { getHash, getPath } from '../../utils'
import { UnocssPluginContext } from '../../context'
import { defaultExclude, defaultInclude } from '../../../../plugins-common/defaults'
import { LAYER_MARK_ALL, getLayerPlaceholder, LAYER_PLACEHOLDER_RE, resolveId } from '../../../../plugins-common/layers'

export function GlobalModeBuildPlugin({ uno, config, scan, tokens }: UnocssPluginContext): Plugin[] {
  const filter = createFilter(
    config.include || defaultInclude,
    config.exclude || defaultExclude,
  )

  const tasks: Promise<any>[] = []
  const entries = new Map<string, string>()

  return [
    {
      name: 'unocss:global:build:scan',
      apply: 'build',
      enforce: 'pre',
      transform(code, id) {
        if (filter(id))
          tasks.push(scan(code, id))
        return null
      },
      transformIndexHtml: {
        enforce: 'pre',
        transform(code, { filename }) {
          tasks.push(scan(code, filename))
        },
      },
      resolveId(id) {
        const entry = resolveId(id)
        if (entry) {
          entries.set(entry.id, entry.layer)
          return entry.id
        }
      },
      load(id) {
        const layer = entries.get(getPath(id))
        if (layer)
          return getLayerPlaceholder(layer)
      },
    },
    {
      name: 'unocss:global:build:generate',
      apply(options, { command }) {
        return command === 'build' && !options.build?.ssr
      },
      enforce: 'post',
      async generateBundle(options, bundle) {
        const files = Object.keys(bundle)
        const cssFiles = files
          .filter(i => i.endsWith('.css'))

        if (!cssFiles.length)
          return

        await Promise.all(tasks)
        const result = await uno.generate(tokens, { layerComments: false })
        let replaced = false

        const cssReplacedMap: Record<string, string> = {}
        for (const file of cssFiles) {
          const chunk = bundle[file]
          if (chunk.type === 'asset' && typeof chunk.source === 'string') {
            let currentReplaced = false
            chunk.source = chunk.source.replace(LAYER_PLACEHOLDER_RE, (_, __, layer) => {
              currentReplaced = true
              replaced = true
              return layer === LAYER_MARK_ALL
                ? result.getLayers(undefined, Array.from(entries.values()))
                : result.getLayer(layer) || ''
            })
            // recalculate hash
            if (currentReplaced) {
              const newName = chunk.fileName.replace(/\.(\w+)\.css$/, `.${getHash(chunk.source)}.css`)
              cssReplacedMap[chunk.fileName] = newName
              chunk.fileName = newName
            }
          }
        }

        if (!replaced)
          this.error(new Error('[unocss] does not found CSS placeholder in the generated chunks,\nthis is likely an internal bug of unocss vite plugin'))

        // rewrite updated CSS hash
        const entires = Object.entries(cssReplacedMap)
        if (!entires.length)
          return
        for (const file of files) {
          const chunk = bundle[file]
          if (chunk.type === 'chunk' && typeof chunk.code === 'string') {
            for (const [k, v] of entires)
              chunk.code = chunk.code.replace(k, v)
          }
          else if (chunk.type === 'asset' && typeof chunk.source === 'string') {
            for (const [k, v] of entires)
              chunk.source = chunk.source.replace(k, v)
          }
        }
      },
    },
  ]
}
