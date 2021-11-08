import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { UnocssPluginContext } from '../context'
import { defaultExclude } from '../utils'

export function VueScopedPlugin({ uno, config }: UnocssPluginContext): Plugin {
  const filter = createFilter(
    config.include || [/\.vue$/],
    config.exclude || defaultExclude,
  )

  async function transformSFC(code: string) {
    const { css } = await uno.generate(code)
    if (!css)
      return null
    return `${code}\n<style scoped>${css}</style>`
  }

  return {
    name: 'unocss:vue-scoped',
    enforce: 'pre',
    transform(code, id) {
      if (!filter(id))
        return
      return transformSFC(code)
    },
    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async() => {
          const code = await read()
          return await transformSFC(code) || code
        }
      }
    },
  }
}
