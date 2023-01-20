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
  let isSvelteKit: boolean
  let unoCssFileRef: string

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

      isSvelteKit = _viteConfig.plugins.findIndex(p => p.name.includes('sveltekit')) > -1
    },

    async buildStart() {
      if (isSvelteKit && viteConfig.command === 'build') {
        const { css } = await uno.generate('', { preflights: true, safelist: true, minify: true })

        unoCssFileRef = this.emitFile({
          type: 'asset',
          name: 'uno.css',
          source: css,
        })
      }
    },

    transform(code, id) {
      if (isSvelteKit && viteConfig.command === 'serve' && isServerHooksFile(id))
        return replacePlaceholderWithPreflightsAndSafelist(uno, code)

      if (filter(id))
        return transformSvelteSFC(code, id, uno, { combine: viteConfig.command === 'build' })
    },

    renderChunk(code, chunk) {
      if (isSvelteKit && viteConfig.command === 'build' && chunk.moduleIds.findIndex(isServerHooksFile) > -1) {
        // todo: Get svelte kit base path.
        const base = ''
        const replacement = `<link href="${base}/${this.getFileName(unoCssFileRef)}" rel="stylesheet" />`
        return code.replace('__UnoCSS_Svelte_Scoped_global_styles__', replacement.replaceAll(/'/g, '\''))
      }
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
