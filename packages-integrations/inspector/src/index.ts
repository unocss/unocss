import type { UnocssPluginContext } from '@unocss/core'
import type { DevframeDefinition } from 'devframe'
import type { DevframeInstance } from 'devframe/initiate'
import type { Server } from 'node:http'
import type { Plugin } from 'vite'
import { initDevframe } from 'devframe/initiate'
import { serveStaticNodeMiddleware } from 'devframe/utils/serve-static'
import { createInspectorDevframe } from './devframe'

export * from './devframe'

const BASE_URL = '/__unocss/'
const DEVTOOLS_DOCK_BASE_URL = '/__unocss-devtools/'
const VITE_DEVTOOLS_URL = '/__devtools/'

/**
 * Structural stand-in for the slice of `@vitejs/devtools-kit`'s node context
 * the dock mount uses (`ctx.install`), so the kit stays out of the dependency
 * tree — `@vitejs/devtools` provides the real implementation when installed.
 */
interface DevtoolsDockContext {
  install: (definition: DevframeDefinition, options?: { base?: string }) => Promise<void>
}

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
  // before the bridge: it serves files (SPA fallback only for
  // extensionless misses) and falls through to the bridge for the RPC
  // endpoints (`__connection.json`), which the bridge's handler answers
  // (and 404s anything else under the base).
  const spa: Plugin = {
    name: 'unocss:inspector:spa',
    apply: 'serve',
    configureServer(server) {
      const clientDist = inspector.definition.clientAssets
      if (typeof clientDist === 'string')
        server.middlewares.use(BASE_URL, serveStaticNodeMiddleware(clientDist))
    },
  }

  // RPC + WebSocket backend, bridged into Vite's own HTTP server, gated by
  // devframe's OTP auth. `allowedOrigins: false` because the endpoint is served
  // same-origin by this dev server (the OTP gate is the trust boundary) — so it
  // still connects when the server is reached at a non-loopback origin
  // (`vite --host`, containers, tunnels), which the loopback-only default refuses.
  let instance: DevframeInstance | undefined
  const bridge: Plugin = {
    name: 'unocss:inspector:rpc',
    apply: 'serve',
    async configureServer(server) {
      await instance?.close().catch(() => {})
      instance = undefined
      try {
        const created = initDevframe(inspector.definition, {
          base: BASE_URL,
          // The SPA plugin above owns the client assets
          distDir: false,
          // Share Vite's HTTP server for the WebSocket upgrade; middleware-mode
          // hosts (no `httpServer`, e.g. Nuxt) get a side-car socket instead.
          // Vite's union includes https/http2 servers — devframe only binds an
          // `upgrade` listener, which all of them emit, so narrow the type.
          ...(server.httpServer ? { server: server.httpServer as Server } : { ws: { sidecar: true } }),
          allowedOrigins: false,
        })
        server.middlewares.use(created.nodeMiddleware)
        await created.ready
        instance = created
      }
      catch (e) {
        console.warn('[unocss:inspector] failed to start the inspector RPC backend:', e)
        return
      }
      server.httpServer?.once('close', () => {
        instance?.close().catch(() => {})
      })
    },
    async closeBundle() {
      await instance?.close().catch(() => {})
      instance = undefined
    },
  }

  // The Vite DevTools dock (mounted only when @vitejs/devtools is installed
  // and enabled), on its own base to keep the two hosts apart. The `devtools`
  // slot is the kit's plugin contract: inert under plain Vite, picked up by
  // the DevTools host, which serves the SPA, registers the iframe dock entry
  // and runs the definition's `setup` through `ctx.install`.
  const devtoolsDock: Plugin & { devtools: { setup: (ctx: DevtoolsDockContext) => Promise<void> } } = {
    name: 'unocss:inspector:devtools',
    devtools: {
      async setup(ctx) {
        await ctx.install(inspector.definition, { base: DEVTOOLS_DOCK_BASE_URL })
        devtoolsActive = true
      },
    },
  }

  return [
    events,
    spa,
    bridge,
    devtoolsDock,
  ]
}
