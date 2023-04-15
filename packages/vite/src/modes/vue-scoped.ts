import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'

export function VueScopedPlugin({ uno, ready }: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.vue$/], uno.config.content.pipeline.exclude)

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
        config.content.pipeline.include || [/\.vue$/],
        config.content.pipeline.exclude,
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
