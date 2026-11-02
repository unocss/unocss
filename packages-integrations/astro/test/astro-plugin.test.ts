import type { Plugin } from 'vite'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import UnoCSSAstro from '@unocss/astro'
import presetWind3 from '@unocss/preset-wind3'
import { normalizePath } from 'vite'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, 'fixtures/basic')
const unoCss = normalizePath(join(root, '__uno.css'))

async function createAstroViteServer() {
  const plugins: Plugin[] = []
  const integration = UnoCSSAstro({
    configFile: false,
    presets: [presetWind3()],
    safelist: ['text-red-500'],
  })
  const setup = integration.hooks!['astro:config:setup']!
  await setup({
    config: {
      root: pathToFileURL(root),
      srcDir: pathToFileURL(join(root, 'src')),
    },
    updateConfig: (config: any) => plugins.push(...config.vite.plugins),
    injectScript: () => {},
  } as any)

  return await vite.createServer({
    root,
    configFile: false,
    logLevel: 'error',
    server: { middlewareMode: true, ws: false },
    plugins,
  })
}

describe('astro integration virtual modules', () => {
  it('serves the entry from a non-virtual path id', async () => {
    const server = await createAstroViteServer()

    try {
      // the entry Astro injects into every page (`import "uno.css"`)
      const entry = await server.environments.ssr.pluginContainer.resolveId('uno.css', 'uno-astro')
      expect(entry?.id).toBe(unoCss)

      // the same request coming from the browser (module url, wrapped id, ...)
      for (const id of ['/__uno.css', '/@id/__x00__/__uno.css', '\0/__uno.css']) {
        const resolved = await server.pluginContainer.resolveId(id)
        expect(resolved?.id).toBe(unoCss)
      }
    }
    finally {
      await server.close()
    }
  })

  it('matches the id Vite uses to inject the style', async () => {
    const server = await createAstroViteServer()

    try {
      // Astro renders `data-vite-dev-id` from the SSR module id and asks the
      // browser to load the module. Vite's client style injection keys on the
      // module id it sees, so both must be identical for the prerendered
      // <style> to be reused instead of appended a second time.
      const styleId = (await server.environments.ssr.pluginContainer.resolveId('uno.css', 'uno-astro'))?.id
      const result = await server.environments.client.transformRequest('/__uno.css')
      const viteId = /const __vite__id = (".*")/.exec(result!.code)?.[1]

      expect(styleId).toBe(unoCss)
      expect(viteId).toBe(JSON.stringify(unoCss))
      expect(result!.code).toContain('.text-red-500')
    }
    finally {
      await server.close()
    }
  })
})
