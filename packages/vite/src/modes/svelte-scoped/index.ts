import type { Plugin, ResolvedConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'
import { defaultExclude } from '../../integration'
import { transformSvelteSFC } from './transform'
import { generateGlobalCss, isServerHooksFile, logErrorIfTransformPageChunkHookNotRight, replacePlaceholderWithPreflightsAndSafelist } from './global'
import { GLOBAL_STYLES_PLACEHOLDER } from './constants'

export * from './transform'

const defaultSvelteScopedInclude = [/\.svelte$/, /\.svelte\.md$/, /\.svx$/]

export function SvelteScopedPlugin({ ready, uno }: UnocssPluginContext): Plugin {
  let viteConfig: ResolvedConfig
  let filter = createFilter(defaultSvelteScopedInclude, defaultExclude)
  let isSvelteKit: boolean
  let unoCssFileReferenceId: string

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

      isSvelteKit = viteConfig.plugins.some(p => p.name.includes('sveltekit'))
    },

    async buildStart() {
      if (isSvelteKit && viteConfig.command === 'build') {
        const css = await generateGlobalCss(uno)
        unoCssFileReferenceId = this.emitFile({
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

    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return (await transformSvelteSFC(code, ctx.file, uno, { combine: false }))?.code || code
        }
      }
    },

    configureServer: logErrorIfTransformPageChunkHookNotRight,

    // build hook
    renderChunk(code, chunk) {
      if (isSvelteKit && chunk.moduleIds.some(id => isServerHooksFile(id))) {
        const base = viteConfig.base ?? '/'
        const unoCssHashedLinkTag = `<link href="${base}${this.getFileName(unoCssFileReferenceId)}" rel="stylesheet" />`
        return code.replace(GLOBAL_STYLES_PLACEHOLDER, unoCssHashedLinkTag.replaceAll(/'/g, '\''))
      }
    },
  }
}
