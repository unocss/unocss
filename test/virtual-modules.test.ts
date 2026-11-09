import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import UnoCSS, { fromViteVirtualId, toViteClientPath, toViteVirtualId } from '@unocss/vite'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'

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
      server.moduleGraph.invalidateModule(server.moduleGraph.getModuleById(file)!)
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
