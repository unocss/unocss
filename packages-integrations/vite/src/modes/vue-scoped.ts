import type { UnocssPluginContext } from '@unocss/core'
import type { Api as VuePluginApi } from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'
import { defaultPipelineExclude, defaultPipelineInclude } from '#integration/defaults'
import { createFilter } from 'unplugin-utils'

export function VueScopedPlugin(ctx: UnocssPluginContext): Plugin {
  // first filter to check if the file should be processed by us
  let filter = createFilter(defaultPipelineInclude, defaultPipelineExclude)
  // second filter to check if the file should be regarded as Vue SFC
  let filterSFC = createFilter([/\.vue$/], defaultPipelineExclude)

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
    async configResolved(viteConfig) {
      const { config } = await ctx.ready
      const vuePlugin = viteConfig.plugins.find(p => p.name === 'vite:vue')?.api as VuePluginApi | undefined
      filter = config.content?.pipeline === false
        ? () => false
        : createFilter(
            config.content?.pipeline?.include ?? defaultPipelineInclude,
            config.content?.pipeline?.exclude ?? defaultPipelineExclude,
          )
      filterSFC = createFilter(
        config.sfc?.include ?? vuePlugin?.include ?? [/\.vue$/],
        // no more fallback as the first filter will already exclude unwanted files
        config.sfc?.exclude ?? vuePlugin?.exclude,
      )
    },
    async transform(code, id) {
      if (!filter(id) || !filterSFC(id))
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
      if (filter(ctx.file) && filterSFC(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return await transformSFC(code) || code
        }
      }
    },
  }
}
