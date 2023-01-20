import type { Plugin, ResolvedConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'
import { defaultExclude } from '../../integration'
import { transformSvelteSFC } from './transform'
import { isServerHooksFile, replacePlaceholderWithPreflightsAndSafelist } from './global'

export * from './transform'

const defaultSvelteScopedInclude = [/\.svelte$/, /\.svelte\.md$/, /\.svx$/]

export function SvelteScopedPlugin({ ready, uno }: UnocssPluginContext): Plugin {
  let viteConfig: ResolvedConfig
  let filter = createFilter(defaultSvelteScopedInclude, defaultExclude)

  return {
    name: 'unocss:svelte-scoped',
    enforce: 'pre',

    async configResolved(_viteConfig) {
      viteConfig = _viteConfig
      const { config } = await ready
      filter = createFilter(
        config.include || defaultSvelteScopedInclude,
        config.exclude || defaultExclude,
      )
    },

    transform(code, id) {
      if (isServerHooksFile(id))
        return replacePlaceholderWithPreflightsAndSafelist(uno, code)

      if (filter(id))
        return transformSvelteSFC(code, id, uno, { combine: viteConfig.command === 'build' })
    },

    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return (await transformSvelteSFC(code, ctx.file, uno, { combine: false }))?.code || code
        }
      }
    },
  }
}
