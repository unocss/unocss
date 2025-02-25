import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { defaultPipelineExclude } from '#integration/defaults'
import { createFilter } from 'unplugin-utils'

export function VueScopedPlugin(ctx: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.vue$/], defaultPipelineExclude)

  async function transformSFC(code: string) {
    await ctx.ready
    const { css } = await ctx.uno.generate(code)
    if (!css)
      return null
    return `${code}\n<style scoped>${css}</style>`
  }

  return {
    name: 'unocss:vue-scoped',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ctx.ready
      filter = config.content?.pipeline === false
        ? () => false
        : createFilter(
            config.content?.pipeline?.include ?? config.include ?? [/\.vue$/],
            config.content?.pipeline?.exclude ?? config.exclude ?? defaultPipelineExclude,
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
