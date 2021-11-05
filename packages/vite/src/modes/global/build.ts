import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { defaultExclude, defaultInclude, getPath } from '../../utils'
import { Context } from '../../context'
import { resolveId, ALL_LAYERS } from './shared'

const PLACEHOLDER_RE = /#--unocss--\s*{\s*layer\s*:\s*(.+?);?\s*}/g

export function GlobalModeBuildPlugin({ uno, config, scan, tokens }: Context): Plugin[] {
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
        transform(code, { path }) {
          tasks.push(scan(code, path))
        },
      },
      resolveId(id) {
        const entry = resolveId(id)
        if (entry) {
          entries.set(entry.id, entry.layer)
          return entry.id
        }
      },
      async load(id) {
        const layer = entries.get(getPath(id))
        if (layer)
          return `#--unocss--{layer:${layer}}`
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
            chunk.source = chunk.source.replace(PLACEHOLDER_RE, (_, layer) => {
              replaced = true
              if (layer === ALL_LAYERS)
                return result.getLayers(Array.from(entries.values()))
              else
                return result.getLayer(layer) || ''
            })
          }
        }

        if (!replaced)
          this.error(new Error('[unocss] does not found CSS placeholder in the generated chunks,\nthis is likely an internal bug of unocss vite plugin'))
      },
    },
  ]
}
