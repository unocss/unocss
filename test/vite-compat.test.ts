import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import * as vite from 'vite'
import { describe, expect, it, vi } from 'vitest'
import { supportsEnvironmentHmr } from '../packages-integrations/vite/src/hmr'
import UnoCSS from '../packages-integrations/vite/src/index'

async function createServer(root: string) {
  return await vite.createServer({
    root,
    configFile: false,
    logLevel: 'error',
    server: { middlewareMode: true, ws: false },
    plugins: [
      UnoCSS({
        configFile: false,
        inspector: false,
        rules: [['uno-hmr-probe', { color: 'red' }]],
      }),
    ],
  })
}

describe('vite compatibility', () => {
  it(`updates global CSS through Vite ${vite.version}`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'unocss-vite-hmr-'))
    const source = resolve(root, 'src/Probe.vue')
    await mkdir(resolve(root, 'src'))
    const server = await createServer(root)

    try {
      const entry = (await server.pluginContainer.resolveId('uno.css'))!.id
      await writeFile(source, '<template><div class="uno-hmr-probe" /></template>')

      if (supportsEnvironmentHmr) {
        await server.environments.client.transformRequest(entry)
        const payloads: unknown[] = []
        const hot = server.environments.client.hot
        const send = hot.send.bind(hot)
        hot.send = (payload: unknown) => {
          payloads.push(payload)
          return send(payload as never)
        }

        server.watcher.emit('add', source)

        await vi.waitFor(() => {
          expect(payloads.some((payload) => {
            return typeof payload === 'object'
              && payload !== null
              && 'type' in payload
              && payload.type === 'update'
          })).toBe(true)
        }, { timeout: 10_000 })
      }
      else {
        await server.transformRequest(entry)
        const plugin = server.config.plugins.find(plugin => plugin.name === 'unocss:global')
        if (!plugin?.handleHotUpdate)
          throw new Error('Expected a legacy Vite HMR hook')

        const legacyHook = plugin.handleHotUpdate
        const handler = typeof legacyHook === 'function' ? legacyHook : legacyHook.handler
        const result = await handler.call({} as ThisParameterType<typeof handler>, {
          file: source,
          modules: [],
          read: async () => '<template><div class="uno-hmr-probe" /></template>',
          timestamp: Date.now(),
          server,
        })

        expect(result?.map((module: vite.ModuleNode) => module.id)).toContain(entry)
      }
    }
    finally {
      await server.close()
      await rm(root, { recursive: true, force: true })
    }
  })
})
