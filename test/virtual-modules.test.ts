import { resolve } from 'node:path'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'
import UnoCSS from '../packages-integrations/vite/src/index'
import { toViteClientPath, toViteHmrPath } from '../packages-integrations/vite/src/virtual'

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

  it('converts internal ids to public client paths', () => {
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
