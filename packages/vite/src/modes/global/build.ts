import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import {
  HASH_PLACEHOLDER_RE, LAYER_MARK_ALL, LAYER_PLACEHOLDER_RE,
  RESOLVED_ID_RE,
  getHash,
  getHashPlaceholder,
  getLayerPlaceholder,
  getPath,
  replaceAsync,
  resolveId,
} from '../../integration'
import type { VitePluginConfig } from '../../types'

export function GlobalModeBuildPlugin({ uno, ready, extract, tokens, modules, filter, getConfig }: UnocssPluginContext<VitePluginConfig>): Plugin[] {
  const vfsLayerMap = new Map<string, string>()
  let tasks: Promise<any>[] = []
  let cssPostPlugin: Plugin | undefined
  let cssPlugin: Plugin | undefined

  async function transformCSS(css: string, id: string) {
    const {
      postcss = true,
    } = await getConfig()
    if (!cssPlugin || !postcss)
      return css
    // @ts-expect-error no this context
    const result = await cssPlugin.transform(css, id)
    if (!result)
      return css
    if (typeof result === 'string')
      css = result
    else if (result.code)
      css = result.code
    css = css.replace(/[\n\r]/g, '')
    return css
  }

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
        cssPostPlugin = config.plugins.find(i => i.name === 'vite:css-post')
        cssPlugin = config.plugins.find(i => i.name === 'vite:css')
        await ready
      },
      // we inject a hash to chunk before the dist hash calculation to make sure
      // the hash is different when unocss changes
      async renderChunk(_, chunk) {
        if (!cssPostPlugin)
          return null

        const chunks = Object.keys(chunk.modules).filter(i => modules.has(i))
        if (!chunks.length)
          return null

        const fakeCssId = `${chunk.fileName}-unocss-hash.css`
        const tokens = new Set<string>()
        await Promise.all(chunks.map(c => uno.applyExtractors(modules.get(c) || '', c, tokens)))
        let { css } = await uno.generate(tokens, { minify: true })
        if (!css)
          return null

        // skip hash generation on non-entry chunk
        if (!Object.keys(chunk.modules).some(i => i.match(RESOLVED_ID_RE)))
          return null

        css = await transformCSS(css, fakeCssId)

        const hash = getHash(css)
        // @ts-expect-error no this context
        await cssPostPlugin.transform(getHashPlaceholder(hash), fakeCssId)
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
            const css = chunk.source
              .replace(HASH_PLACEHOLDER_RE, '')

            chunk.source = await replaceAsync(css, LAYER_PLACEHOLDER_RE, async (_, __, layer) => {
              replaced = true
              return await transformCSS(layer === LAYER_MARK_ALL
                ? result.getLayers(undefined, Array.from(vfsLayerMap.values()))
                : result.getLayer(layer) || '', `${chunk.fileName}.css`)
            })
          }
        }

        if (!replaced)
          this.error(new Error('[unocss] does not found CSS placeholder in the generated chunks,\nthis is likely an internal bug of unocss vite plugin'))
      },
    },
  ]
}
