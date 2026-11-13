import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import UnoCSS, { fromViteVirtualId, toViteClientPath, toViteVirtualId } from '@unocss/vite'
import * as vite from 'vite'
import { describe, expect, it, vi } from 'vitest'
import { ConfigHMRPlugin } from '../packages-integrations/vite/src/config-hmr'

const ROOT = resolve(import.meta.dirname, 'fixtures/vite')

describe('vite virtual modules', () => {
  async function createServer(mode: 'global' | 'per-module', root = ROOT) {
    return await vite.createServer({
      root,
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

  async function registerEntry(server: vite.ViteDevServer, id = 'uno.css') {
    const entry = (await server.pluginContainer.resolveId(id))!.id
    await server.environments.client.transformRequest(entry)
    return entry
  }

  function getGlobalPlugin(server: vite.ViteDevServer) {
    return server.config.plugins.find(plugin => plugin.name === 'unocss:global') as any
  }

  function getContext(server: vite.ViteDevServer) {
    const apiPlugin = server.config.plugins.find(plugin => plugin.name === 'unocss:api') as any
    return apiPlugin.api.getContext()
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

  async function runHotUpdate(server: vite.ViteDevServer, file: string, code: string, type: 'delete' | 'update' = 'update') {
    return await getGlobalPlugin(server).hotUpdate.handler.call(
      { environment: server.environments.client },
      {
        type,
        file,
        modules: [],
        read: async () => code,
        timestamp: Date.now(),
        server,
      },
    )
  }

  it('reloads a deleted config source', async () => {
    const config = resolve(ROOT, 'uno.config.ts')
    const reloadConfig = vi.fn()
    const plugin = ConfigHMRPlugin({
      ready: Promise.resolve(),
      getConfigFileList: () => [config],
      reloadConfig,
    } as any)!

    expect(plugin.enforce).toBe('pre')

    const hotUpdate = plugin.hotUpdate!
    const handler = typeof hotUpdate === 'function' ? hotUpdate : hotUpdate.handler
    await handler.call(
      { environment: { name: 'client' } } as any,
      { file: config, type: 'delete' } as any,
    )

    expect(reloadConfig).toHaveBeenCalledOnce()
  })

  it.runIf(process.env.VITE_COMPAT === 'true')(`updates global CSS through Vite ${vite.version}`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'unocss-vite-hmr-'))
    const source = resolve(root, 'src/Probe.vue')
    await mkdir(resolve(root, 'src'))
    const server = await createServer('global', root)

    try {
      const entry = (await server.pluginContainer.resolveId('uno.css'))!.id
      await writeFile(source, '<template><div class="uno-hmr-probe" /></template>')

      await server.environments.client.transformRequest(entry)
      const payloads = captureHotPayloads(server)

      server.watcher.emit('add', source)

      await vi.waitFor(() => {
        expect(payloads.some(payload => payload.type === 'update')).toBe(true)
      }, { timeout: 10_000 })
    }
    finally {
      await server.close()
      await rm(root, { recursive: true, force: true })
    }
  })

  it('serves the global stylesheet through a path id and query entries through virtual ids', async () => {
    const server = await createServer('global')

    try {
      expect((await server.pluginContainer.resolveId('/__uno.css?inline'))?.id)
        .toBe('\0/__uno.css?inline')
      expect((await server.pluginContainer.resolveId('virtual:uno.css'))?.id)
        .toBe('/__uno.css')
      expect((await server.pluginContainer.resolveId('uno.css'))?.id)
        .toBe('/__uno.css')
      expect((await server.pluginContainer.resolveId('uno:icons.css'))?.id)
        .toBe('/__uno_icons.css')
      expect((await server.pluginContainer.resolveId('D:/tmp/app/__uno.css'))?.id)
        .toBe('/__uno.css')
      const wrapper = await server.transformRequest('/__uno.css')
      expect(/(?:const|let|var) __vite__id = "([^"]+)"/.exec(wrapper?.code ?? '')?.[1])
        .toBe('/__uno.css')
      expect(server.moduleGraph.getModuleById('/__uno.css')?.url)
        .toBe('/__uno.css')
    }
    finally {
      await server.close()
    }
  })

  it('converts ids to and from virtual ids', () => {
    expect(toViteVirtualId('/src/main.ts'))
      .toBe('\0/src/main.ts')
    expect(toViteVirtualId('\0/src/main.ts'))
      .toBe('\0/src/main.ts')
    expect(fromViteVirtualId('\0/src/main.ts'))
      .toBe('/src/main.ts')
    expect(fromViteVirtualId('/src/main.ts'))
      .toBe('/src/main.ts')
  })

  it('wraps virtual ids into browser paths', () => {
    expect(toViteClientPath('\0/__uno.css'))
      .toBe('/@id/__x00__/__uno.css')
    expect(toViteClientPath('/src/main.ts'))
      .toBe('/src/main.ts')
  })

  it('reloads a config discovered from a Vite root outside the cwd', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'unocss-config-root-')))
    const configFile = resolve(root, 'uno.config.ts')
    const source = (color: string) => `export default { rules: [['probe', { color: '${color}' }]] }`
    await writeFile(configFile, source('red'))
    const server = await vite.createServer({
      root,
      configFile: false,
      logLevel: 'error',
      server: { host: '127.0.0.1', port: 0, watch: { usePolling: true, interval: 20 } },
      plugins: [UnoCSS({ inspector: false })],
    })
    await server.listen()
    const ctx = server.config.plugins.find(plugin => plugin.name === 'unocss:api')!.api.getContext()

    try {
      await vi.waitFor(() => expect(Object.values(server.watcher.getWatched()).flat()).toContain('uno.config.ts'), { timeout: 5000 })
      expect(ctx.getConfigFileList().map(vite.normalizePath)).toEqual([vite.normalizePath(configFile)])
      await writeFile(configFile, source('blue'))

      await vi.waitFor(async () => {
        expect((await ctx.uno.generate('probe', { preflights: false })).css).toContain('color:blue')
      }, { timeout: 5000 })
    }
    finally {
      await server.close()
      await rm(root, { recursive: true, force: true })
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

      expect(result?.map((mod: vite.EnvironmentModuleNode) => mod.id)).toContain('/__uno.css')
    }
    finally {
      await server.close()
    }
  })

  it('generates CSS once when multiple virtual layers update', async () => {
    const server = await createServer('global')

    try {
      const entries = [
        await registerEntry(server, 'uno:first.css'),
        await registerEntry(server, 'uno:second.css'),
      ]
      expect(entries.every(entry => server.environments.client.moduleGraph.getModuleById(entry))).toBe(true)

      const generate = vi.spyOn(getContext(server).uno, 'generate')
      await runHotUpdate(
        server,
        resolve(ROOT, 'src/Probe.vue'),
        '<template><div class="uno-hmr-probe" /></template>',
      )

      expect(generate).toHaveBeenCalledOnce()
    }
    finally {
      await server.close()
    }
  })

  it('returns every entry for a layer when the generated CSS changes', async () => {
    const server = await createServer('global')

    try {
      const entries = [
        await registerEntry(server, 'uno.css'),
        await registerEntry(server, 'uno.css?inline'),
      ]
      const result = await runHotUpdate(
        server,
        resolve(ROOT, 'src/Probe.vue'),
        '<template><div class="uno-hmr-probe" /></template>',
      )

      expect(result?.map((mod: vite.EnvironmentModuleNode) => mod.id))
        .toEqual(expect.arrayContaining(entries))
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

  it('refreshes CSS after a source file is deleted', async () => {
    const server = await createServer('global')
    const source = resolve(ROOT, 'src/Deleted.vue')

    try {
      await registerEntry(server)
      const changed = await runHotUpdate(server, source, '<template><div class="uno-hmr-probe" /></template>')
      for (const mod of changed)
        server.environments.client.moduleGraph.invalidateModule(mod)
      await server.environments.client.transformRequest('/__uno.css')
      const result = await runHotUpdate(server, source, '', 'delete')

      expect(result?.map((mod: vite.EnvironmentModuleNode) => mod.id)).toContain('/__uno.css')
    }
    finally {
      await server.close()
    }
  })

  it('removes query-suffixed content when its source file is deleted', async () => {
    const server = await createServer('global')
    const source = resolve(ROOT, 'src/Deleted.vue')

    try {
      const ctx = getContext(server)
      await ctx.extract('uno-hmr-probe', `${source}?vue&type=template`)
      await registerEntry(server)
      await runHotUpdate(server, source, '', 'delete')

      expect(ctx.modules.has(`${source}?vue&type=template`)).toBe(false)
      expect(ctx.tokens.has('uno-hmr-probe')).toBe(false)
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

  it('refreshes CSS when a lazy transform adds new tokens', async () => {
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
        expect(payloads.some(payload =>
          payload.type === 'custom' && payload.event === 'unocss:refresh',
        )).toBe(true)
      }, { timeout: 10_000 })
    }
    finally {
      await server.close()
    }
  })

  it('sends the HMR path that Vite registers for the CSS module', async () => {
    const root = await mkdtemp(join(tmpdir(), 'unocss-vite-hmr-'))
    const probe = resolve(root, 'src/Probe.vue')
    const server = await createServer('global', root)

    try {
      await mkdir(resolve(root, 'src'))
      await registerEntry(server)
      const registered = server.environments.client.moduleGraph.getModuleById('/__uno.css')!.url
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
      await server.close()
      await rm(root, { recursive: true, force: true })
    }
  })
})
