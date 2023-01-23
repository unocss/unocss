import type { UnoGenerator } from '@unocss/core'
import type { ViteDevServer } from 'vite'
import { GLOBAL_STYLES_PLACEHOLDER } from './constants'

/**
 * It would be nice to parse the svelte config to learn if user set a custom hooks.server name but both of the following methods have problems:
 * - const svelteConfigRaw = readFileSync('./svelte.config.js', 'utf-8') // manual parsing could fail if people import hooks name from elsewhere or use unstandard syntax
 * - ({ default: svelteConfig } = await import(`${viteConfig.root}/svelte.config.js`)) // throws import errors when vitePreprocess is included in svelte.config.js on Windows (related to path issues)
 */
export function isServerHooksFile(path: string) {
  return path.includes('hooks') && path.includes('server')
}

export function replaceGlobalStylesPlaceholder(code: string, stylesTag: string) {
  const captureQuoteMark = '(["\'`])'
  const matchCapturedQuoteMark = '\\1'
  const QUOTES_WITH_PLACEHOLDER_RE = new RegExp(captureQuoteMark + GLOBAL_STYLES_PLACEHOLDER + matchCapturedQuoteMark)

  const escapedStylesTag = stylesTag.replaceAll(/`/g, '\\`')
  return code.replace(QUOTES_WITH_PLACEHOLDER_RE, `\`${escapedStylesTag}\``)
  // preset-web-fonts doesn't heed the minify option and sends through newlines (\n) that break if we use regular quotes here, always using a backtick here is easier than removing newlines, which are actually kind of useful in dev mode. I might consider turning minify off altogether in dev mode.
}

export async function replacePlaceholderWithPreflightsAndSafelist(uno: UnoGenerator, code: string) {
  const css = await generateGlobalCss(uno)
  return {
    code: replaceGlobalStylesPlaceholder(code, `<style>${css}</style>`),
  }
}

export async function generateGlobalCss(uno: UnoGenerator): Promise<string> {
  const { css } = await uno.generate('', { preflights: true, safelist: true, minify: true })
  return css
}

export function logErrorIfTransformPageChunkHookNotRight(server: ViteDevServer) {
  server.middlewares.use((req, res, next) => {
    const originalWrite = res.write

    res.write = function (chunk, ...rest) {
      const str = (chunk instanceof Buffer) ? chunk.toString() : ((Array.isArray(chunk) || 'at' in chunk) ? Buffer.from(chunk).toString() : (`${chunk}`))

      if (str.includes('%unocss.global%') || str.includes(GLOBAL_STYLES_PLACEHOLDER)) {
        server.config.logger.error(
          'You did not setup the UnoCSS svelte-scoped integration for SvelteKit correctly.\n'
          + 'Please follow the instructions at https://github.com/unocss/unocss/blob/main/packages/vite/README.md#sveltesveltekit-scoped-mode.\n'
          + 'You can see an example of the usage at https://github.com/unocss/unocss/tree/main/examples/sveltekit-scoped.'
          , { timestamp: true })
      }

      // @ts-expect-error Mismatch caused by overloads
      return originalWrite.call(this, chunk, ...rest)
    }

    next()
  })
}
