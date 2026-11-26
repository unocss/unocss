import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import UnoCSS, { fromViteVirtualId, toViteClientPath, toViteVirtualId } from '@unocss/vite'
import * as vite from 'vite'
import { describe, expect, it, vi } from 'vitest'

describe('vite virtual module ids', () => {
  async function createServer(mode: 'global' | 'per-module') {
    return await vite.createServer({
      root: resolve(import.meta.dirname, 'fixtures/vite'),
      configFile: false,
      logLevel: 'error',
      server: { middlewareMode: true, ws: false },
      plugins: [UnoCSS({ configFile: false, inspector: false, mode })],
    })
  }

  it('serves global CSS through a path id', async () => {
    const server = await createServer('global')

    try {
      expect((await server.pluginContainer.resolveId('uno.css'))?.id)
        .toBe('/__uno.css')
      expect((await server.pluginContainer.resolveId('virtual:uno.css'))?.id)
        .toBe('/__uno.css')
      expect((await server.pluginContainer.resolveId('/__uno.css?inline'))?.id)
        .toBe('\0/__uno.css?inline')
      expect((await server.pluginContainer.resolveId('uno:icons.css'))?.id)
        .toBe('/__uno_icons.css')

      // Frameworks may resolve `uno.css` through a srcDir and hand back an
      // absolute file path.
      expect((await server.pluginContainer.resolveId('D:/tmp/app/__uno.css'))?.id)
        .toBe('/__uno.css')

      // Vite keys its dev style by this id; Nuxt writes the same url into
      // `<link>`, so the de-duplication selector matches (#5406).
      const wrapper = await server.transformRequest('/__uno.css')
      expect(/(?:const|let|var) __vite__id = "([^"]+)"/.exec(wrapper?.code ?? '')?.[1])
        .toBe('/__uno.css')

      // HMR invalidates the module by the id stored in `entries`.
      expect(server.moduleGraph.getModuleById('/__uno.css')?.url)
        .toBe('/__uno.css')
    }
    finally {
      await server.close()
    }
  })

  it('keeps inline CSS virtual in every dev environment', async () => {
    const server = await createServer('global')

    try {
      const environments = server.environments
        ? Object.values(server.environments)
        : [server]
      for (const environment of environments) {
        expect((await environment.pluginContainer.resolveId('/__uno.css?inline'))?.id)
          .toBe('\0/__uno.css?inline')
        expect((await environment.pluginContainer.resolveId('/__uno.css'))?.id)
          .toBe('/__uno.css')
      }
    }
    finally {
      await server.close()
    }
  })

  describe('inline CSS in dev', () => {
    async function createInlineServer(files: Record<string, string>, rules: any[] = [['probe', { color: 'red' }]]) {
      const root = await realpath(await mkdtemp(join(tmpdir(), 'unocss-inline-dev-')))
      for (const [name, content] of Object.entries(files))
        await writeFile(join(root, name), content)
      const server = await vite.createServer({
        root,
        configFile: false,
        logLevel: 'silent',
        server: { host: '127.0.0.1', port: 0, watch: null },
        plugins: [UnoCSS({ configFile: false, inspector: false, rules })],
      })
      await server.listen()
      const { port } = server.httpServer!.address() as { port: number }
      const socket = new WebSocket(`ws://127.0.0.1:${port}/?token=${server.config.webSocketToken}`, 'vite-hmr')
      const events: string[] = []
      socket.addEventListener('message', ({ data }) => {
        const payload = JSON.parse(String(data))
        if (payload.type === 'update')
          events.push(...payload.updates.map((update: { path: string }) => update.path))
        if (payload.type === 'full-reload')
          events.push('full-reload')
      })
      await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))

      const inlineUrl = () => server.moduleGraph.getModuleById('\0/__uno.css?inline')!.url
      return {
        server,
        events,
        inlineUrl,
        async fetchInline() {
          const code = (await server.transformRequest(inlineUrl()))!.code
          const data = JSON.parse(/import\.meta\.hot\.send\('unocss:hmr', (.+)\)/.exec(code)![1])
          return { code, run: () => socket.send(JSON.stringify({ type: 'custom', event: 'unocss:hmr', data })) }
        },
        async runInline() {
          const inline = await this.fetchInline()
          inline.run()
          return inline.code
        },
        async close() {
          socket.close()
          await server.close()
          await rm(root, { recursive: true, force: true })
        },
      }
    }

    it('updates importers when a later module changes the CSS, and only then', async () => {
      const dev = await createInlineServer({
        'main.js': 'import "virtual:uno.css"\nimport css from "virtual:uno.css?inline"\nexport default css\nimport.meta.hot.accept()\n',
        'noise.jsx': 'export const word = "plain"\n',
        'late.jsx': 'export const className = "probe"\n',
      })

      try {
        await dev.server.transformRequest('/main.js')
        expect(await dev.runInline()).not.toContain('.probe')
        await dev.server.transformRequest('/__uno.css')

        await dev.server.transformRequest('/noise.jsx')
        await vi.waitFor(() => expect(dev.events).toContain('/__uno.css'))
        expect(dev.events).not.toContain('/main.js')

        await dev.server.transformRequest('/late.jsx')
        await vi.waitFor(() => expect(dev.events).toContain('/main.js'))
        expect((await dev.server.transformRequest(dev.inlineUrl()))?.code).toContain('.probe{color:red;}')
      }
      finally {
        await dev.close()
      }
    })

    it('updates importers when the later module imports the inline CSS too', async () => {
      const dev = await createInlineServer({
        'main.js': 'import css from "virtual:uno.css?inline"\nexport default css\n',
        'late.jsx': 'import css from "virtual:uno.css?inline"\nexport const className = "probe"\nexport default css\n',
      })

      try {
        await dev.server.transformRequest('/main.js')
        await dev.runInline()
        await dev.server.transformRequest('/late.jsx')
        await vi.waitFor(() => expect(dev.events).toContain('full-reload'))
      }
      finally {
        await dev.close()
      }
    })

    it('updates importers when the CSS changed before the browser ran the inline module', async () => {
      const dev = await createInlineServer({
        'main.js': 'import css from "virtual:uno.css?inline"\nexport default css\n',
        'late.jsx': 'export const className = "probe"\n',
      })

      try {
        await dev.server.transformRequest('/main.js')
        const inline = await dev.fetchInline()
        await dev.server.transformRequest('/late.jsx')
        inline.run()
        await vi.waitFor(() => expect(dev.events).toContain('full-reload'))
      }
      finally {
        await dev.close()
      }
    })

    it('keeps the server alive and reports a failing rule through the inline module', async () => {
      const dev = await createInlineServer({
        'main.js': 'import "virtual:uno.css"\nimport css from "virtual:uno.css?inline"\nexport default css\n',
        'bad.jsx': 'export const className = "boom"\n',
      }, [[/^boom$/, () => { throw new Error('rule boom') }]])

      try {
        await dev.server.transformRequest('/main.js')
        await dev.runInline()
        await dev.server.transformRequest('/__uno.css')
        await dev.server.transformRequest('/bad.jsx')
        await vi.waitFor(() => expect(dev.events).toEqual(expect.arrayContaining(['/__uno.css', 'full-reload'])))
        await expect(dev.server.transformRequest(dev.inlineUrl())).rejects.toThrow('rule boom')
      }
      finally {
        await dev.close()
      }
    })

    it('does not reload the page for inline CSS that only SSR loads', async () => {
      const dev = await createInlineServer({
        'main.js': 'import "virtual:uno.css"\n',
        'server.js': 'import css from "virtual:uno.css?inline"\nexport default css\n',
        'late.jsx': 'export const className = "probe"\n',
      })

      try {
        await dev.server.transformRequest('/main.js')
        await dev.server.transformRequest('/__uno.css')
        await dev.server.ssrLoadModule('/server.js')
        await dev.server.transformRequest('/late.jsx')
        await vi.waitFor(() => expect(dev.events).toContain('/__uno.css'))
        expect(dev.events).not.toContain('full-reload')
        expect((await dev.server.ssrLoadModule('/server.js')).default).toContain('.probe{color:red;}')
      }
      finally {
        await dev.close()
      }
    })
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

  it('clears per-module CSS when a module loses its last utility', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'unocss-per-module-')))
    const file = resolve(root, 'view.tsx')
    await writeFile(file, 'export const className = "probe"')
    const server = await vite.createServer({
      root,
      configFile: false,
      logLevel: 'error',
      server: { middlewareMode: true, ws: false },
      plugins: [UnoCSS({ configFile: false, inspector: false, mode: 'per-module', rules: [['probe', { color: 'red' }]] })],
    })

    try {
      const transformed = await server.transformRequest('/view.tsx')
      const cssUrl = `/@unocss/${/\/@unocss\/(\w+\.css)/.exec(transformed?.code ?? '')?.[1]}`
      expect((await server.transformRequest(cssUrl))?.code).toContain('.probe{color:red;}')

      await writeFile(file, 'export const className = "plain"')
      server.moduleGraph.invalidateModule((await server.moduleGraph.getModuleByUrl('/view.tsx'))!)
      await server.transformRequest('/view.tsx')

      expect((await server.transformRequest(cssUrl))?.code).not.toContain('.probe{color:red;}')
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
})
