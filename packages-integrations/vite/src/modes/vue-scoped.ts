import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { defaultPipelineExclude } from '#integration/defaults'
import { createFilter } from 'unplugin-utils'

export function VueScopedPlugin(ctx: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.vue$/], defaultPipelineExclude)
  let globalLayers: string[] = []
  let globalStylesInserted = false

  async function transformSFC(code: string) {
    await ctx.ready
    const { css, getLayers } = await ctx.uno.generate(code)
    if (!css)
      return null

    const result = [
      code,
      `<style scoped>${getLayers(undefined, globalLayers)}</style>`,
    ]

    if (!globalStylesInserted) {
      const globalCSS = getLayers(globalLayers)
      if (globalCSS) {
        result.push(`<style>${globalCSS}</style>`)
        globalStylesInserted = true
      }
    }

    return result.join('\n')
  }

  return {
    name: 'unocss:vue-scoped',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ctx.ready
      globalLayers = ctx.uno.config.preflights.map(p => p.layer ?? '')
      globalStylesInserted = false // Reset when config is resolved

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
