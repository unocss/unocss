import type { Plugin, ResolvedConfig } from 'vite'
import type { SvelteScopedContext } from '../preprocess'
import { checkTransformPageChunkHook, generateGlobalCss, isServerHooksFile, replaceGlobalStylesPlaceholder } from './global'
import { DEV_GLOBAL_STYLES_DATA_TITLE, PLACEHOLDER_USER_SETS_IN_INDEX_HTML } from './constants'
import type { UnocssSvelteScopedViteOptions } from './types'

export function GlobalStylesPlugin({ ready, uno }: SvelteScopedContext, injectReset?: UnocssSvelteScopedViteOptions['injectReset']): Plugin {
  let isSvelteKit: boolean
  let viteConfig: ResolvedConfig
  let unoCssFileReferenceId: string
  let unoCssHashedLinkTag: string

  return {
    name: 'unocss:svelte-scoped:global-styles',

    async configResolved(_viteConfig) {
      viteConfig = _viteConfig
      await ready
      isSvelteKit = viteConfig.plugins.some(p => p.name.includes('sveltekit'))
    },

    // serve
    configureServer: server => checkTransformPageChunkHook(server, isSvelteKit),

    // serve
    async transform(code, id) {
      if (isSvelteKit && viteConfig.command === 'serve' && isServerHooksFile(id)) {
        const css = await generateGlobalCss(uno, injectReset)
        return {
          code: replaceGlobalStylesPlaceholder(code, `<style type="text/css" data-title="${DEV_GLOBAL_STYLES_DATA_TITLE}">${css}</style>`),
        }
      }
    },

    // build
    async buildStart() {
      if (viteConfig.command === 'build') {
        const css = await generateGlobalCss(uno, injectReset)
        unoCssFileReferenceId = this.emitFile({
          type: 'asset',
          name: 'unocss-svelte-scoped-global.css',
          source: css,
        })
      }
    },

    // build
    renderStart() {
      const unoCssFileName = this.getFileName(unoCssFileReferenceId)
      const base = viteConfig.base ?? '/'
      unoCssHashedLinkTag = `<link href="${base}${unoCssFileName}" rel="stylesheet" />`
    },

    // build
    renderChunk(code, chunk) {
      if (isSvelteKit && chunk.moduleIds.some(id => isServerHooksFile(id)))
        return replaceGlobalStylesPlaceholder(code, unoCssHashedLinkTag)
    },

    // serve and build
    async transformIndexHtml(html) {
      // SvelteKit ignores this hook, so we use the `renderChunk` and `transform` hooks instead for SvelteKit, but if they ever support running this hook inside their hooks.server.js file we can simplify to just using this hook.
      if (!isSvelteKit) {
        if (viteConfig.command === 'build')
          return html.replace(PLACEHOLDER_USER_SETS_IN_INDEX_HTML, unoCssHashedLinkTag)

        if (viteConfig.command === 'serve') {
          const css = await generateGlobalCss(uno, injectReset)
          return html.replace(PLACEHOLDER_USER_SETS_IN_INDEX_HTML, `<style type="text/css" data-title="${DEV_GLOBAL_STYLES_DATA_TITLE}">${css}</style>`)
        }
      }
    },
  }
}
