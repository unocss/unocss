import type { Plugin, ViteDevServer } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import MagicString from 'magic-string'

let lastUpdate = Date.now()
const modules = new Set<string>()
let timerId: any

export function initTransformerPlugins(ctx: UnocssPluginContext): Plugin[] {
  async function applyTransformers(code: string, id: string, enforce?: 'pre' | 'post') {
    const transformers = (ctx.uno.config.transformers || []).filter(i => i.enforce === enforce)
    if (!transformers.length)
      return

    const s = new MagicString(code)
    for (const t of transformers) {
      if (t.idFilter) {
        if (!t.idFilter(id))
          continue
      }
      else if (!ctx.filter(code, id)) {
        continue
      }
      await t.transform(s, id, ctx)
    }
    if (s.hasChanged()) {
      modules.add(id)
      return {
        code: s.toString(),
        map: s.generateMap({ hires: true, source: id }),
      }
    }
  }

  let server: ViteDevServer

  ctx.onInvalidate(() => {
    if (!server)
      return
    for (const id of modules) {
      const modules = server.moduleGraph.getModulesByFile(id)
      if (modules) {
        for (const module of modules)
          server.moduleGraph.invalidateModule(module)
      }
    }
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      lastUpdate = Date.now()
      server.ws.send({
        type: 'update',
        updates: Array.from(modules)
          .map(id => server.moduleGraph.getModulesByFile(id))
          .map(items => items ? Array.from(items) : [])
          .flat()
          .map(module => module.url)
          .reduce((acc, url) => {
            if (!acc.includes(url))
              acc.push(url)
            return acc
          }, [] as string[])
          .map(id => ({
            acceptedPath: id,
            path: id,
            timestamp: lastUpdate,
            type: 'js-update',
          })),
      })
    }, 1000)
  })

  return [
    {
      name: 'unocss:transformers:default',
      transform(code, id) {
        return applyTransformers(code, id)
      },
    },
    {
      name: 'unocss:transformers:pre',
      enforce: 'pre',
      transform(code, id) {
        return applyTransformers(code, id, 'pre')
      },
    },
    {
      name: 'unocss:transformers:post',
      enforce: 'post',
      transform(code, id) {
        return applyTransformers(code, id, 'post')
      },
    },
    {
      name: 'unocss:transformers:hmr-style',
      configureServer(_server) {
        server = _server
      },
    },
  ]
}
