import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { devframeViteBridge, devframeVitePlugin } from '@devframes/vite/single'
import { createPluginFromDevframe } from '@vitejs/devtools-kit/node'
import { createInspectorDevframe } from './devframe'

export * from './devframe'

const BASE_URL = '/__unocss/'
const DEVTOOLS_DOCK_BASE_URL = '/__unocss-devtools/'
const VITE_DEVTOOLS_URL = '/__devtools/'

export default function UnocssInspector(ctx: UnocssPluginContext): Plugin[] {
  const inspector = createInspectorDevframe(ctx)

  // Flipped when the Vite DevTools host mounts the inspector dock
  let devtoolsActive = false

  let invalidateTimer: ReturnType<typeof setTimeout> | undefined
  ctx.onInvalidate(() => {
    clearTimeout(invalidateTimer)
    invalidateTimer = setTimeout(() => inspector.notifyInvalidated(), 200)
  })
  ctx.onReload(() => inspector.notifyConfigChanged())

  const events: Plugin = {
    name: 'unocss:inspector',
    apply: 'serve',
    async configureServer(server) {
      await ctx.ready

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]

        // The SPA is built with a relative base — normalize the visit
        // to a trailing slash so relative assets resolve
        if (url === BASE_URL.slice(0, -1)) {
          res.statusCode = 302
          res.setHeader('Location', BASE_URL)
          res.end()
          return
        }

        // The standalone inspector URL is deprecated in favor of the Vite
        // DevTools dock — when the DevTools host is active, top-level visits
        // are redirected to it. Iframe embeds (Vite DevTools dock, Nuxt
        // DevTools tab) and older browsers without `Sec-Fetch-Dest` keep
        // being served the standalone SPA.
        if (
          devtoolsActive
          && (url === BASE_URL || url === `${BASE_URL}index.html`)
          && req.headers['sec-fetch-dest'] === 'document'
        ) {
          res.statusCode = 302
          res.setHeader('Location', VITE_DEVTOOLS_URL)
          res.end()
          return
        }
        next()
      })
    },
    handleHotUpdate(hmrCtx) {
      inspector.notifyModuleUpdated({ path: hmrCtx.file })
    },
  }

  // The standalone SPA at /__unocss/ (deprecated surface). Mounted
  // before the bridge: it serves files and falls through to the bridge
  // for the RPC endpoints (`__connection.json`), which the bridge's
  // handler answers (and 404s anything else under the base).
  const spa = devframeVitePlugin(inspector.definition, { base: BASE_URL })
  spa.name = 'unocss:inspector:spa'

  // RPC + WebSocket backend, bridged into Vite's own HTTP server.
  // Gated by devframe's interactive OTP auth by default.
  const bridge = devframeViteBridge(inspector.definition, { base: BASE_URL })
  bridge.name = 'unocss:inspector:rpc'

  return [
    events,
    spa,
    bridge,
    // The Vite DevTools dock (mounted only when @vitejs/devtools is
    // installed and enabled), on its own base to keep the two hosts apart
    createPluginFromDevframe(inspector.definition, {
      name: 'unocss:inspector:devtools',
      base: DEVTOOLS_DOCK_BASE_URL,
      setup: () => {
        devtoolsActive = true
      },
    }) as Plugin,
  ]
}
