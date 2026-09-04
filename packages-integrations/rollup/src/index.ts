import type { UserConfigDefaults } from '@unocss/core'
import type { RollupPluginConfig, UnoCSSRollupPlugin } from './types'
import process from 'node:process'
import { LAYER_IMPORTS } from '@unocss/core'
import { setupContentExtractor } from '#integration/content'
import { createContext } from '#integration/context'
import { resolveId, resolveLayer } from '#integration/layers'
import { applyTransformers } from '#integration/transformers'

export * from './types'

export function defineConfig<Theme extends object>(config: RollupPluginConfig<Theme>) {
  return config
}

export default function RollupPlugin<Theme extends object>(
  configOrPath?: RollupPluginConfig<Theme> | string,
  defaults: UserConfigDefaults = {},
): UnoCSSRollupPlugin {
  const ctx = createContext<RollupPluginConfig>(configOrPath as any, {
    envMode: process.env.NODE_ENV === 'development' ? 'dev' : 'build',
    ...defaults,
  })
  const { extract, filter, flushTasks, getConfig, tasks, tokens } = ctx
  const vfsLayers = new Map<string, string>()
  const unocssImporters = new Set<string>()
  let lastTokenSize = 0
  let css = ''

  async function generateCss() {
    await flushTasks()
    if (lastTokenSize === tokens.size)
      return css

    const result = await ctx.uno.generate(tokens, { minify: true })
    css = result.getLayers(undefined, [LAYER_IMPORTS, ...vfsLayers.keys()])
    lastTokenSize = tokens.size
    return css
  }

  return {
    name: 'unocss:rollup',
    async buildStart() {
      await ctx.ready
      vfsLayers.clear()
      tasks.length = 0
      lastTokenSize = 0
      css = ''
      tasks.push(setupContentExtractor(ctx))
    },
    async transform(code, id) {
      if (!filter(code, id))
        return null

      const preTransform = await applyTransformers(ctx, code, id, 'pre')
      const defaultTransform = await applyTransformers(ctx, preTransform?.code || code, id)
      const postTransform = await applyTransformers(ctx, defaultTransform?.code || preTransform?.code || code, id, 'post')
      const transformedCode = postTransform?.code || defaultTransform?.code || preTransform?.code || code

      tasks.push(extract(transformedCode, id))
      return postTransform || defaultTransform || preTransform || null
    },
    async resolveId(id, importer) {
      const entry = await resolveId(ctx, id, importer)
      if (!entry)
        return

      const layer = await resolveLayer(ctx, entry)
      if (!layer)
        return entry

      if (importer)
        unocssImporters.add(importer)

      if (vfsLayers.has(layer)) {
        this.warn(`[unocss] ${JSON.stringify(id)} is being imported multiple times in different files, using the first occurrence: ${JSON.stringify(vfsLayers.get(layer))}`)
        return vfsLayers.get(layer)
      }

      const virtualEntry = `\0unocss:${layer}`
      vfsLayers.set(layer, virtualEntry)
      return virtualEntry
    },
    load(id) {
      const layer = Array.from(vfsLayers).find(([, entry]) => entry === id)?.[0]
      if (!layer)
        return

      return {
        code: '',
        map: null,
        moduleSideEffects: true,
      }
    },
    shouldTransformCachedModule({ id }) {
      return unocssImporters.delete(id)
    },
    async generateBundle() {
      if (!vfsLayers.size) {
        if ((await getConfig()).checkImport) {
          this.warn('[unocss] Entry module not found. Did you add `import \'uno.css\'` in your main entry?')
        }
        return
      }

      this.emitFile({
        type: 'asset',
        name: 'uno.css',
        source: await generateCss(),
      })
    },
  }
}
