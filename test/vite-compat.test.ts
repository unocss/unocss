import { resolve } from 'node:path'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'
import UnoCSS from '../packages-integrations/vite/src/index'

const ROOT = resolve(import.meta.dirname, 'fixtures/vite')
const supportsEnvironmentHmr = Number.parseInt(vite.version) >= 8

describe('vite compatibility', () => {
  async function createServer() {
    return await vite.createServer({
      root: ROOT,
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

  it(`uses the supported HMR hook in Vite ${vite.version}`, async () => {
    const server = await createServer()

    try {
      const plugin = server.config.plugins.find(
        plugin => plugin.name === 'unocss:global',
      ) as any
      const entry = await server.pluginContainer.resolveId('uno.css')
      const id = entry!.id

      if (supportsEnvironmentHmr) {
        await server.environments.client.transformRequest(id)
        const result = await plugin.hotUpdate.handler.call(
          { environment: server.environments.client },
          {
            type: 'update',
            file: resolve(ROOT, 'src/Probe.vue'),
            modules: [],
            read: async () =>
              '<template><div class="uno-hmr-probe" /></template>',
            timestamp: Date.now(),
            server,
          },
        )

        expect(plugin.handleHotUpdate).toBeUndefined()
        expect(result?.map((mod: any) => mod.id)).toContain(id)
      }
      else {
        await server.transformRequest(id)
        const result = await plugin.handleHotUpdate.call(
          {},
          {
            file: resolve(ROOT, 'src/Probe.vue'),
            modules: [],
            read: async () =>
              '<template><div class="uno-hmr-probe" /></template>',
            timestamp: Date.now(),
            server,
          },
        )

        expect(plugin.hotUpdate).toBeUndefined()
        expect(result?.map((mod: any) => mod.id)).toContain(id)
      }
    }
    finally {
      await server.close()
    }
  })
})
