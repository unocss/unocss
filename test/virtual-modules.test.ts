import { rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as vite from 'vite'
import { describe, expect, it, vi } from 'vitest'
import UnoCSS from '../packages-integrations/vite/src/index'

const ROOT = resolve(import.meta.dirname, 'fixtures/vite')

describe('vite virtual modules', () => {
  async function createServer(mode: 'global' | 'per-module') {
    return await vite.createServer({
      root: ROOT,
      configFile: false,
      logLevel: 'error',
      server: { middlewareMode: true, ws: false },
      plugins: [UnoCSS({
        configFile: false,
        inspector: false,
        mode,
        rules: [['uno-hmr-probe', { color: 'red' }]],
      })],
    })
  }

  async function registerEntry(server: vite.ViteDevServer) {
    await server.pluginContainer.resolveId('uno.css')
    await server.environments.client.transformRequest('\0/__uno.css')
  }

  function getGlobalPlugin(server: vite.ViteDevServer) {
    return server.config.plugins.find(plugin => plugin.name === 'unocss:global') as any
  }

  function captureHotPayloads(server: vite.ViteDevServer) {
    const payloads: any[] = []
    const hot = server.environments.client.hot as any
    const originalSend = hot.send.bind(hot)
    hot.send = (payload: any) => {
      payloads.push(payload)
      return originalSend(payload)
    }
    return payloads
  }

  async function runHotUpdate(server: vite.ViteDevServer, file: string, code: string) {
    return await getGlobalPlugin(server).hotUpdate.handler.call(
      { environment: server.environments.client },
      {
        type: 'update',
        file,
        modules: [],
        read: async () => code,
        timestamp: Date.now(),
        server,
      },
    )
  }

  function getRegisteredHotPath(code: string) {
    return JSON.parse(code.match(/createHotContext\((".*?")\)/)![1]) as string
  }

  it('uses internal ids for global CSS', async () => {
    const server = await createServer('global')

    try {
      expect((await server.pluginContainer.resolveId('/__uno.css?inline'))?.id)
        .toBe('\0/__uno.css?inline')
      expect((await server.pluginContainer.resolveId('virtual:uno.css'))?.id)
        .toBe('\0/__uno.css')
    }
    finally {
      await server.close()
    }
  })

  it('uses internal ids for per-module CSS', async () => {
    const server = await createServer('per-module')

    try {
      expect((await server.pluginContainer.resolveId('/__uno.css?inline'))?.id)
        .toBe('\0/__uno.css?inline')
      expect((await server.pluginContainer.resolveId('virtual:uno.css'))?.id)
        .toBe('\0/__uno.css')
      expect((await server.pluginContainer.resolveId('/@unocss/test.css?inline'))?.id)
        .toBe('\0/@unocss/test.css?inline')
    }
    finally {
      await server.close()
    }
  })

  it('returns the CSS module from hotUpdate when the generated CSS changes', async () => {
    const server = await createServer('global')

    try {
      await registerEntry(server)
      const result = await runHotUpdate(
        server,
        resolve(ROOT, 'src/Probe.vue'),
        '<template><div class="uno-hmr-probe" /></template>',
      )

      expect(result?.map((mod: vite.EnvironmentModuleNode) => mod.id)).toContain('\0/__uno.css')
    }
    finally {
      await server.close()
    }
  })

  it('leaves the module list untouched when the generated CSS does not change', async () => {
    const server = await createServer('global')

    try {
      await registerEntry(server)
      const result = await runHotUpdate(
        server,
        resolve(ROOT, 'src/Probe.vue'),
        '<template><div class="uno-hmr-not-a-rule" /></template>',
      )

      expect(result).toBeUndefined()
    }
    finally {
      await server.close()
    }
  })

  it('leaves HTML to Vite so the page still reloads', async () => {
    const server = await createServer('global')

    try {
      await registerEntry(server)
      const result = await runHotUpdate(
        server,
        resolve(ROOT, 'index.html'),
        '<div class="uno-hmr-probe" />',
      )

      expect(result).toBeUndefined()
    }
    finally {
      await server.close()
    }
  })

  it('injects the refresh listener only for the base CSS module URL', async () => {
    const server = await createServer('global')

    try {
      await registerEntry(server)
      const code = (await server.environments.client.transformRequest('\0/__uno.css'))!.code

      expect(code).toContain('unocss:refresh')
      expect(code).toContain('searchParams.has(\'t\')')
    }
    finally {
      await server.close()
    }
  })

  it('refreshes the CSS module when a lazy transform adds new tokens', async () => {
    const server = await createServer('global')

    try {
      await registerEntry(server)
      const payloads = captureHotPayloads(server)

      await getGlobalPlugin(server).transform.call(
        {},
        '<template><div class="uno-hmr-probe" /></template>',
        resolve(ROOT, 'src/Lazy.vue'),
      )

      await vi.waitFor(() => {
        expect(payloads.some(payload => payload.type === 'custom' && payload.event === 'unocss:refresh')).toBe(true)
      }, { timeout: 10_000 })
    }
    finally {
      await server.close()
    }
  })

  it('sends the HMR path that Vite registers for the CSS module', async () => {
    const server = await createServer('global')
    const probe = resolve(ROOT, 'src/__uno-hmr-probe.vue')

    try {
      await registerEntry(server)
      const code = (await server.environments.client.transformRequest('\0/__uno.css'))!.code
      const registered = getRegisteredHotPath(code)
      const payloads = captureHotPayloads(server)

      await writeFile(probe, '<template><div class="uno-hmr-probe" /></template>')
      server.watcher.emit('add', probe)

      await vi.waitFor(() => {
        expect(payloads.some(payload => payload.type === 'update')).toBe(true)
      }, { timeout: 10_000 })

      const updates = payloads.flatMap(payload => payload.type === 'update' ? payload.updates : [])
      const cssUpdate = updates.find(update => update.acceptedPath === registered)

      expect(cssUpdate).toBeDefined()
      expect(cssUpdate.path).toBe(registered)
    }
    finally {
      await rm(probe, { force: true })
      await server.close()
    }
  })
})
