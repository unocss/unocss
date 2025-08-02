import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { defaultPipelineExclude } from '#integration/defaults'
import { notNull } from '@unocss/core'
import { createFilter } from 'unplugin-utils'

export function VueScopedPlugin(ctx: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.vue$/], defaultPipelineExclude)
  let globalLayers: string[] = []
  const globalStylesCache = new Map<string, string>()

  async function transformSFC(code: string) {
    await ctx.ready
    const { css, getLayer, getLayers } = await ctx.uno.generate(code)
    if (!css)
      return null

    const result = [code]

    const hasCssLayerStatementRule = ctx.uno.config.outputToCssLayers && globalLayers.length
    if (hasCssLayerStatementRule) {
      result.push(`<style>${getLayers().split('\n')[0]}</style>`)
    }

    globalLayers.forEach((layerName) => {
      const cached = globalStylesCache.get(layerName)
      const layerCSS = getLayer(layerName)
      if (layerCSS) {
        if (!cached || (cached !== layerCSS)) {
          globalStylesCache.set(layerName, layerCSS)
          result.push(`<style>${layerCSS}</style>`)
        }
      }
    })

    result.push(`<style scoped>${
      getLayers(undefined, globalLayers).split('\n').slice(hasCssLayerStatementRule ? 1 : 0).join('\n')
    }</style>`)

    return result.join('\n')
  }

  return {
    name: 'unocss:vue-scoped',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ctx.ready

      const layersOrder = ctx.uno.config.layers
      globalLayers = ctx.uno.config.preflights
        .map(p => p.layer)
        .filter(notNull)
        .sort((a, b) =>
          layersOrder[a] - layersOrder[b])
      globalStylesCache.clear()

      filter = config.content?.pipeline === false
        ? () => false
        : createFilter(
            config.content?.pipeline?.include ?? [/\.vue$/],
            config.content?.pipeline?.exclude ?? defaultPipelineExclude,
          )
    },
    async transform(code, id) {
      if (!filter(id) || !id.endsWith('.vue'))
        return
      const css = await transformSFC(code)

      if (css) {
        return {
          code: css,
          map: null,
        }
      }
    },
    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return await transformSFC(code) || code
        }
      }
    },
  }
}
