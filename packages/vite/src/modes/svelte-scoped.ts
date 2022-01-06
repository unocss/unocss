import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '../../../plugins-common'
import { defaultExclude } from '../../../plugins-common'

export function SvelteScopedPlugin({ uno, ready }: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.svelte$/], defaultExclude)

  async function transformSFC(code: string) {
    const { css } = await uno.generate(code)
    if (!css)
      return null
    return `${code}\n<style>${css}</style>`
  }

  return {
    name: 'unocss:svelte-scoped',
    enforce: 'pre',
    async configResolved() {
      const { config } = await ready
      filter = createFilter(
        config.include || [/\.svelte$/],
        config.exclude || defaultExclude,
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
        ctx.read = async() => {
          const code = await read()
          return await transformSFC(code) || code
        }
      }
    },
  }
}
