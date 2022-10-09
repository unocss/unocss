import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'
import { defaultExclude } from '../../integration'
import { transformSFC } from './transform'

export * from './transform'

export function SvelteScopedPlugin({ ready, uno }: UnocssPluginContext): Plugin {
  let filter = createFilter([/\.svelte$/], defaultExclude)

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
      return transformSFC(code, id, uno)
    },
    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return await transformSFC(code, ctx.file, uno) || code
        }
      }
    },
  }
}

