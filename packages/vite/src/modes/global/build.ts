import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { getPath } from '../../utils'
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
          .filter(i => i.endsWith('.css'))

        if (!files.length)
          return

        await Promise.all(tasks)
        const result = await uno.generate(tokens, { layerComments: false })
        let replaced = false

        for (const file of files) {
          const chunk = bundle[file]
          if (chunk.type === 'asset' && typeof chunk.source === 'string') {
            chunk.source = chunk.source.replace(LAYER_PLACEHOLDER_RE, (_, __, layer) => {
              replaced = true
              return layer === LAYER_MARK_ALL
                ? result.getLayers(undefined, Array.from(entries.values()))
                : result.getLayer(layer) || ''
            })
          }
        }

        if (!replaced)
          this.error(new Error('[unocss] does not found CSS placeholder in the generated chunks,\nthis is likely an internal bug of unocss vite plugin'))
      },
    },
  ]
}
