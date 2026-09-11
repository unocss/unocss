import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import UnoCSS, { fromViteVirtualId, toViteClientPath, toViteVirtualId } from '@unocss/vite'
import * as vite from 'vite'
import { describe, expect, it, vi } from 'vitest'
import { toViteHmrPath } from '../packages-integrations/vite/src/virtual'

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
        .toBe('/__uno.css?inline')
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

  it('resolves HMR paths for the Vite version that registers them', () => {
    expect(toViteHmrPath('\0/__uno.css', '7.3.0'))
      .toBe('/@id/__x00__/__uno.css')
    expect(toViteHmrPath('\0/__uno.css', '8.2.2'))
      .toBe('/@id/__x00__/__uno.css')
    expect(toViteHmrPath('\0/__uno.css', '8.3.0-beta.1'))
      .toBe('\0/__uno.css')
    expect(toViteHmrPath('\0/__uno.css', '8.3.0'))
      .toBe('\0/__uno.css')
    expect(toViteHmrPath('\0/__uno.css', '9.0.0'))
      .toBe('\0/__uno.css')
    expect(toViteHmrPath('/src/main.ts', '8.3.0'))
      .toBe('/src/main.ts')
  })

  it('matches the hot context path registered by the running Vite', async () => {
    const server = await createServer('global')

    try {
      const result = await server.environments.client.transformRequest('\0/__uno.css')
      const registered = JSON.parse(result!.code.match(/createHotContext\((".*?")\)/)![1])
      const mod = server.environments.client.moduleGraph.getModuleById('\0/__uno.css')

      expect(toViteHmrPath(mod!.url))
        .toBe(registered)
    }
    finally {
      await server.close()
    }
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
})
