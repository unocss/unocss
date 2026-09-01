import { resolve } from 'node:path'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'
import UnoCSS from '../packages-integrations/vite/src/index'

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
