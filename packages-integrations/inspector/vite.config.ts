import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import { alias } from '../../alias'
import UnoCSS from '../../packages-presets/unocss/src/vite'

/** Base the dev-only devframe RPC backend is mounted at (see `startDevBackend`). */
const DEV_RPC_BASE = '/__unocss/'

interface DevBackend {
  base: string
  meta: unknown
}

/**
 * Start a standalone devframe RPC backend for the client-only dev server
 * (`dev:client`), so the SPA has a real server to talk to while iterating on
 * the UI. It scans the inspector's own sources for something to inspect and
 * opts out of the auth gate — a single-user localhost playground.
 *
 * It runs as its own server on a side-car port. The client connects to it
 * directly over an absolute URL (not through a Vite proxy — Vite's proxy
 * mangles devframe's WebSocket frames and breaks its SSE session
 * correlation), so it's fully isolated from Vite's own HMR socket and
 * dev-server restarts. The connection descriptor is injected into the client
 * so it skips the cross-origin `__connection.json` fetch; the cross-origin
 * WebSocket itself is allowed because the backend disables its origin check.
 * Guarded on `globalThis` so a config re-evaluation (Vite reload) reuses the
 * one instance instead of leaking a second server.
 *
 * Imported by its built package entry (`@unocss/inspector/devframe`) rather
 * than `./src`, because Vite's config bundler can't resolve the `#integration`
 * subpath imports in source — run `nr build` in this package first.
 */
function startDevBackend(): Promise<DevBackend | undefined> {
  const g = globalThis as unknown as { __unocssInspectorDevBackend?: Promise<DevBackend | undefined> }
  g.__unocssInspectorDevBackend ??= (async () => {
    try {
      const { createStandaloneInspectorDevframe } = await import('@unocss/inspector/devframe')
      const { createDevServer } = await import('devframe/adapters/dev')
      const inspector = await createStandaloneInspectorDevframe({
        root: import.meta.dirname,
        config: './uno.config.ts',
        patterns: ['client/**/*.{vue,ts}', 'src/**/*.ts'],
      })
      const server = await createDevServer(inspector.definition, {
        host: '127.0.0.1',
        auth: false, // single-user localhost playground — no OTP gate
        openBrowser: false,
        // The SPA connects cross-origin (from Vite's port) — accept it on this
        // localhost-only backend.
        allowedOrigins: false,
      })
      return {
        base: `http://127.0.0.1:${server.port}${DEV_RPC_BASE}`,
        meta: server.connectionMeta(),
      }
    }
    catch (error) {
      console.warn('[unocss:inspector] could not start the dev RPC backend — run `nr build` in this package first.\n', error)
      return undefined
    }
  })()
  return g.__unocssInspectorDevBackend
}

export default defineConfig(async ({ command }) => {
  const backend = command === 'serve' ? await startDevBackend() : undefined

  return {
    resolve: {
      alias,
    },
    // Relative base so the built SPA can be mounted at any path
    // (`/__unocss/` standalone, or the Vite DevTools dock base)
    base: command === 'build' ? './' : '/',
    define: backend
      ? {
          'import.meta.env.VITE_INSPECTOR_RPC_BASE': JSON.stringify(backend.base),
          'import.meta.env.VITE_INSPECTOR_RPC_META': JSON.stringify(JSON.stringify(backend.meta)),
        }
      : {},
    plugins: [
      UnoCSS('uno.config.ts'),
      Vue(),
      Components({
        dirs: 'client/components',
        dts: 'client/components.d.ts',
      }),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          '@vueuse/core',
        ],
        dts: 'client/auto-imports.d.ts',
      }),
      Pages({
        dirs: 'client/pages',
      }),
    ],
    build: {
      outDir: 'dist/client',
    },
  }
})
