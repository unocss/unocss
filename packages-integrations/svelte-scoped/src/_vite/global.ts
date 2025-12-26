import type { UnoGenerator } from '@unocss/core'
import type { ViteDevServer } from 'vite'
import type { UnocssSvelteScopedViteOptions } from './types'
import { DEV_GLOBAL_STYLES_DATA_TITLE, PLACEHOLDER_USER_SETS_IN_INDEX_HTML } from './constants'
import { getReset } from './getReset'

export async function generateGlobalCss(uno: UnoGenerator, injectReset?: UnocssSvelteScopedViteOptions['injectReset']): Promise<string> {
  const { css } = await uno.generate('', { preflights: true, safelist: true, minify: true })
  const reset = injectReset ? getReset(injectReset) : ''
  return reset + css
}

export function checkTransformPageChunkHook(server: ViteDevServer, isSvelteKit: boolean) {
  server.middlewares.use((req, res, next) => {
    const originalWrite = res.write

    res.write = function (chunk, ...rest) {
      // eslint-disable-next-line node/prefer-global/buffer
      const str = typeof chunk === 'string' ? chunk : (chunk instanceof Buffer) ? chunk.toString() : ((Array.isArray(chunk) || 'at' in chunk) ? Buffer.from(chunk).toString() : (`${chunk}`))

      if (str.includes('<head>') && !str.includes(DEV_GLOBAL_STYLES_DATA_TITLE))
        server.config.logger.error(`[unocss] You have not setup the svelte-scoped global styles correctly. You must place '${PLACEHOLDER_USER_SETS_IN_INDEX_HTML}' in your \`${isSvelteKit ? 'app.html' : 'index.html'}\` file.`, { timestamp: true })

      // @ts-expect-error - TS doesn't like this
      return originalWrite.call(this, chunk, ...rest)
    }

    next()
  })
}
