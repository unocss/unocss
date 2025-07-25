import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { defaultPipelineExclude } from '#integration/defaults'
import { LAYER_PREFLIGHTS } from '@unocss/core'
import { createFilter } from 'unplugin-utils'

export function VueScopedPlugin(ctx: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.vue$/], defaultPipelineExclude)
  let globalLayers: string[] = []

  async function transformSFC(code: string) {
    await ctx.ready
    const { css, getLayers } = await ctx.uno.generate(code)
    if (!css)
      return null

    return [
      code,
      `<style>${getLayers(globalLayers)}</style>`,
      `<style scoped>${getLayers(undefined, globalLayers)}</style>`,
    ].join('\n')
  }

  return {
    name: 'unocss:vue-scoped',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ctx.ready
      globalLayers = ctx.uno.config.preflights.filter(p => p.mode === 'global').map(p => p.layer || LAYER_PREFLIGHTS)

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
