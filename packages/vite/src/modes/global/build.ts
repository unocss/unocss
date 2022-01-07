import type { Plugin } from 'vite'
import { getHash, getPath } from '../../../../plugins-common/utils'
import type { UnocssPluginContext } from '../../../../plugins-common/context'
import {
  HASH_PLACEHOLDER_RE,
  LAYER_MARK_ALL,
  LAYER_PLACEHOLDER_RE,
  getHashPlaceholder,
  getLayerPlaceholder,
  resolveId,
} from '../../../../plugins-common'

export function GlobalModeBuildPlugin({ uno, ready, extract, tokens, modules, filter }: UnocssPluginContext): Plugin[] {
  const vfsLayerMap = new Map<string, string>()
  let tasks: Promise<any>[] = []
  let cssPlugin: Plugin | undefined

  return [
    {
      name: 'unocss:global:build:scan',
      apply: 'build',
      enforce: 'pre',
      buildStart() {
        tasks = []
        vfsLayerMap.clear()
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
      resolveId(id) {
        const entry = resolveId(id)
        if (entry) {
          vfsLayerMap.set(entry.id, entry.layer)
          return entry.id
        }
      },
      load(id) {
        const layer = vfsLayerMap.get(getPath(id))
        if (layer)
          return getLayerPlaceholder(layer)
      },
      async configResolved(config) {
        cssPlugin = config.plugins.find(i => i.name === 'vite:css-post')
        await ready
      },
      // we inject a hash to chunk before the dist hash calculation to make sure
      // the hash is different when unocss changes
      async renderChunk(_, chunk) {
        if (!cssPlugin)
          return null

        const chunks = Object.keys(chunk.modules).filter(i => modules.has(i))

        if (!chunks.length)
          return null

        const tokens = new Set<string>()
        await Promise.all(chunks.map(c => uno.applyExtractors(modules.get(c) || '', c, tokens)))
        const { css } = await uno.generate(tokens, { minify: true })
        if (!css)
          return null
        const hash = getHash(css)

        // fool the css plugin to generate the css in corresponding chunk
        const fakeCssId = `${chunk.fileName}-unocss-hash.css`
        // @ts-expect-error no this context
        await cssPlugin.transform(getHashPlaceholder(hash), fakeCssId)
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
      name: 'unocss:global:build:generate',
      apply(options, { command }) {
        return command === 'build' && !options.build?.ssr
      },
      enforce: 'post',
      // rewrite the css placeholders
      async generateBundle(_, bundle) {
        const files = Object.keys(bundle)
        const cssFiles = files
          .filter(i => i.endsWith('.css'))

        if (!cssFiles.length)
          return

        await Promise.all(tasks)
        const result = await uno.generate(tokens, { minify: true })
        let replaced = false

        for (const file of cssFiles) {
          const chunk = bundle[file]
          if (chunk.type === 'asset' && typeof chunk.source === 'string') {
            chunk.source = chunk.source
              .replace(HASH_PLACEHOLDER_RE, '')
              .replace(LAYER_PLACEHOLDER_RE, (_, __, layer) => {
                replaced = true
                return layer === LAYER_MARK_ALL
                  ? result.getLayers(undefined, Array.from(vfsLayerMap.values()))
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
