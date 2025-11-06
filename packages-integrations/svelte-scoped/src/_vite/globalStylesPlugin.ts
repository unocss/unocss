import type { Plugin, ResolvedConfig } from 'vite'
import type { SvelteScopedContext } from '../preprocess'
import type { UnocssSvelteScopedViteOptions } from './types'
import { DEV_GLOBAL_STYLES_DATA_TITLE, GLOBAL_STYLES_CSS_FILE_NAME, PLACEHOLDER_USER_SETS_IN_INDEX_HTML } from './constants'
import { checkTransformPageChunkHook, generateGlobalCss } from './global'

export function GlobalStylesPlugin(ctx: SvelteScopedContext, injectReset?: UnocssSvelteScopedViteOptions['injectReset']): Plugin {
  let isSvelteKit: boolean
  let viteConfig: ResolvedConfig
  let unoCssFileReferenceId: string
  let unoCssGlobalFileName: string

  return {
    name: 'unocss:svelte-scoped:global-styles',

    async configResolved(_viteConfig) {
      viteConfig = _viteConfig
      await ctx.ready
      isSvelteKit = viteConfig.plugins.some(p => p.name.includes('sveltekit'))
    },

    // serve
    configureServer: (server) => {
      checkTransformPageChunkHook(server, isSvelteKit)

      server.middlewares.use(`${viteConfig.base ?? '/'}${GLOBAL_STYLES_CSS_FILE_NAME}`, async (_req, res) => {
        res.appendHeader('Content-Type', 'text/css')
        res.end(await generateGlobalCss(ctx.uno, injectReset))
      })
    },

    // serve
    async transform(code, id) {
      await ctx.ready

      if (isSvelteKit) {
        // Check for outdated setup.
        if (id.includes('hooks') && id.includes('server') && code.includes('unocss_svelte_scoped_global_styles')) {
          this.warn(`[unocss] You are probably using an outdated setup for your sveltekit app. The server hook to handle an unocss styles placeholder is no longer needed.`)
        }

        if (viteConfig.command === 'serve' && code.includes(PLACEHOLDER_USER_SETS_IN_INDEX_HTML)) {
          // This replaces inside a file generated from the `app.html`. The placeholder is wrapped inside double quotes, thus the escaping.
          const tag = `<link href=\\"${viteConfig.base ?? '/'}${GLOBAL_STYLES_CSS_FILE_NAME}\\" rel=\\"stylesheet\\" data-title=\\"${DEV_GLOBAL_STYLES_DATA_TITLE}\\" />`

          return {
            code: code.replace(PLACEHOLDER_USER_SETS_IN_INDEX_HTML, tag),
          }
        }
      }
    },

    // build
    async buildStart() {
      if (viteConfig.command === 'build') {
        const css = await generateGlobalCss(ctx.uno, injectReset)
        unoCssFileReferenceId = this.emitFile({
          type: 'asset',
          name: GLOBAL_STYLES_CSS_FILE_NAME,
          source: css,
        })
      }
    },

    // build
    renderStart() {
      unoCssGlobalFileName = this.getFileName(unoCssFileReferenceId)
    },

    // build
    renderChunk(code) {
      if (isSvelteKit && code.includes(PLACEHOLDER_USER_SETS_IN_INDEX_HTML)) {
        // This replaces inside a file generated from the `app.html`. The placeholder is wrapped inside double quotes, thus the escaping.
        const tag = `<link href=\\"${viteConfig.base ?? '/'}${unoCssGlobalFileName}\\" rel=\\"stylesheet\\" />`

        return code.replace(PLACEHOLDER_USER_SETS_IN_INDEX_HTML, tag)
      }
    },

    // serve and build
    async transformIndexHtml(html) {
      // SvelteKit ignores this hook, so we use the `renderChunk` and `transform` hooks instead for SvelteKit, but if they ever support running this hook inside their hooks.server.js file we can simplify to just using this hook.
      if (!isSvelteKit) {
        if (viteConfig.command === 'build')
          return html.replace(PLACEHOLDER_USER_SETS_IN_INDEX_HTML, `<link href="${viteConfig.base ?? '/'}${unoCssGlobalFileName}" rel="stylesheet" />`)

        if (viteConfig.command === 'serve') {
          return html.replace(PLACEHOLDER_USER_SETS_IN_INDEX_HTML, `<link href="${viteConfig.base ?? '/'}${GLOBAL_STYLES_CSS_FILE_NAME}" rel="stylesheet" data-title="${DEV_GLOBAL_STYLES_DATA_TITLE}" />`)
        }
      }
    },
  }
}
