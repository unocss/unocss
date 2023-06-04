import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'
import { defaultPipelineExclude } from '../integration'

export function VueScopedPlugin({ uno, ready }: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.vue$/], defaultPipelineExclude)

  async function transformSFC(code: string) {
    const { css } = await uno.generate(code)
    if (!css)
      return null
    return `${code}\n<style scoped>${css}</style>`
  }

  return {
    name: 'unocss:vue-scoped',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ready
      filter = createFilter(
        config.content?.pipeline?.include ?? config.include ?? [/\.vue$/],
        config.content?.pipeline?.exclude ?? config.exclude ?? defaultPipelineExclude,
      )
    },
    transform(code, id) {
      if (!filter(id))
        return
      return transformSFC(code)
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
