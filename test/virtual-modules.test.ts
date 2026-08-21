import { resolve } from 'node:path'
import UnoCSS from '@unocss/vite'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'

describe('virtual module ids', () => {
  it('keeps virtual CSS requests internal for Vite SSR', async () => {
    const server = await vite.createServer({
      root: resolve(import.meta.dirname, 'fixtures/vite'),
      configFile: false,
      logLevel: 'error',
      server: { middlewareMode: true },
      plugins: [UnoCSS({ configFile: false, inspector: false, mode: 'per-module' })],
    })

    try {
      expect((await server.pluginContainer.resolveId('/__uno.css?inline'))?.id)
        .toBe('\0__uno.css?inline')
      expect((await server.pluginContainer.resolveId('virtual:uno.css'))?.id)
        .toBe('\0__uno.css')
      expect((await server.pluginContainer.resolveId('/@unocss/test.css?inline'))?.id)
        .toBe('\0/@unocss/test.css?inline')
    }
    finally {
      await server.close()
    }
  })
})
