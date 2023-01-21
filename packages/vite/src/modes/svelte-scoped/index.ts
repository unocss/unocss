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
  let svelteConfig: any
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
      if (isSvelteKit) {
        ({ default: svelteConfig } = await import(`${viteConfig.root}/svelte.config.js`))

        if (viteConfig.command === 'build') {
          const { css } = await uno.generate('', { preflights: true, safelist: true, minify: true })

          unoCssFileRef = this.emitFile({
            type: 'asset',
            name: 'uno.css',
            source: css,
          })
        }
      }
    },

    transform(code, id) {
      if (isSvelteKit && viteConfig.command === 'serve' && isServerHooksFile(id, svelteConfig))
        return replacePlaceholderWithPreflightsAndSafelist(uno, code)

      if (filter(id))
        return transformSvelteSFC(code, id, uno, { combine: viteConfig.command === 'build' })
    },

    async renderChunk(code, chunk) {
      if (isSvelteKit && viteConfig.command === 'build' && chunk.moduleIds.findIndex(id => isServerHooksFile(id, svelteConfig)) > -1) {
        const base = svelteConfig.kit.paths?.base ?? ''
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

    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        const originalWrite = res.write

        res.write = function (chunk, ...rest) {
          const str = (chunk instanceof Buffer) ? chunk.toString() : ((Array.isArray(chunk) || 'at' in chunk) ? Buffer.from(chunk).toString() : (`${chunk}`))

          if (str.includes('%unocss.global%') || str.includes('__UnoCSS_Svelte_Scoped_global_styles__')) {
            viteConfig.logger.error(
              'You did not setup the unocss svelte-scoped integration for SvelteKit correctly. '
              + 'Please follow the instructions at https://github.com/unocss/unocss/blob/main/packages/vite/README.md#sveltesveltekit-scoped-mode. '
              + 'You can see an example of the usage at https://github.com/unocss/unocss/tree/main/examples/sveltekit-scoped.'
              , { timestamp: true })
          }

          // @ts-expect-error Mismatch caused by overloads
          return originalWrite.call(this, chunk, ...rest)
        }

        next()
      })
    },
  }
}
