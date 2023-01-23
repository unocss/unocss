import type { Plugin, ResolvedConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'
import { defaultExclude } from '../../integration'
import { transformSvelteSFC } from './transform'
import { generateGlobalCss, isServerHooksFile, logErrorIfTransformPageChunkHookNotRight, replaceGlobalStylesPlaceholder, replacePlaceholderWithPreflightsAndSafelist } from './global'
import { PLACEHOLDER_USER_SETS_IN_INDEX_HTML } from './constants'

export * from './transform'

const defaultSvelteScopedInclude = [/\.svelte$/, /\.svelte\.md$/, /\.svx$/]

export function SvelteScopedPlugin({ ready, uno }: UnocssPluginContext): Plugin {
  let viteConfig: ResolvedConfig
  let filter = createFilter(defaultSvelteScopedInclude, defaultExclude)
  let isSvelteKit: boolean
  let unoCssFileReferenceId: string
  let unoCssHashedLinkTag: string

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

    transform(code, id) {
      if (isSvelteKit && viteConfig.command === 'serve' && isServerHooksFile(id))
        return replacePlaceholderWithPreflightsAndSafelist(uno, code)

      if (filter(id))
        return transformSvelteSFC({ code, id, uno, options: { combine: viteConfig.command === 'build' } })
    },

    handleHotUpdate(ctx) {
      const read = ctx.read
      if (filter(ctx.file)) {
        ctx.read = async () => {
          const code = await read()
          return (await transformSvelteSFC({ code, id: ctx.file, uno, options: { combine: false } }))?.code || code
        }
      }
    },

    configureServer: logErrorIfTransformPageChunkHookNotRight,

    async buildStart() {
      if (viteConfig.command === 'build') {
        const css = await generateGlobalCss(uno)
        unoCssFileReferenceId = this.emitFile({
          type: 'asset',
          name: 'uno.css',
          source: css,
        })
      }
    },

    renderStart() {
      const unoCssFileName = this.getFileName(unoCssFileReferenceId)
      const base = viteConfig.base ?? '/'
      unoCssHashedLinkTag = `<link href="${base}${unoCssFileName}" rel="stylesheet" />`
    },

    renderChunk(code, chunk) {
      if (isSvelteKit && chunk.moduleIds.some(id => isServerHooksFile(id)))
        return replaceGlobalStylesPlaceholder(code, unoCssHashedLinkTag)
    },

    async transformIndexHtml(html) {
      // SvelteKit (as of 1.2.0) ignores this hook, so we use the `renderChunk` and `transform` hooks instead for SvelteKit, but if they ever support running this hook inside their hooks.server.js file we can simplify to just using this hook.
      if (!isSvelteKit) {
        if (viteConfig.command === 'build')
          return html.replace(PLACEHOLDER_USER_SETS_IN_INDEX_HTML, unoCssHashedLinkTag)

        if (viteConfig.command === 'serve') {
          const css = await generateGlobalCss(uno)
          return html.replace(PLACEHOLDER_USER_SETS_IN_INDEX_HTML, `<style>${css}</style>`)
        }
      }
    },
  }
}
