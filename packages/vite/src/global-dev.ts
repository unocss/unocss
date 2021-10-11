import type { Plugin, ViteDevServer } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { mergeSet, UnoGenerator } from 'unocss'
import { defaultExclude, defaultInclude } from './utils'
import { UnocssUserOptions } from '.'

const VIRTUAL_ENTRY = '/@unocss/entry.css'

export function GlobalModeDevPlugin(uno: UnoGenerator, options: UnocssUserOptions): Plugin {
  let server: ViteDevServer | undefined

  const filter = createFilter(
    options.include || defaultInclude,
    options.exclude || defaultExclude,
  )

  const invalidate = () => {
    if (!server)
      return
    const mod = server.moduleGraph.getModuleById(VIRTUAL_ENTRY)
    if (!mod)
      return
    server.moduleGraph.invalidateModule(mod)
    server.ws.send({
      type: 'update',
      updates: [{
        acceptedPath: VIRTUAL_ENTRY,
        path: VIRTUAL_ENTRY,
        timestamp: +Date.now(),
        type: 'js-update',
      }],
    })
  }

  const tokens = new Set<string>()

  return {
    name: 'unocss:global',
    apply: 'serve',
    enforce: 'pre',
    configureServer(_server) {
      server = _server
    },
    async transform(code, id) {
      if (!filter(id))
        return

      uno.applyExtractors(code)
        .then((sets) => {
          mergeSet(tokens, sets)
          invalidate()
        })

      return null
    },
    resolveId(id) {
      return id === VIRTUAL_ENTRY ? id : null
    },
    async load(id) {
      if (id !== VIRTUAL_ENTRY)
        return null

      if (tokens.size === 0)
        await new Promise(resolve => setTimeout(resolve, 400))

      const { css } = await uno.generate(tokens)
      return `/* unocss */\n${css}`
    },
    transformIndexHtml: {
      enforce: 'pre',
      async transform(code) {
        uno.applyExtractors(code)
          .then((sets) => {
            sets.forEach(i => tokens.add(i))
            invalidate()
          })

        return `${code}<script src="${VIRTUAL_ENTRY}" type="module"></script>`
      },
    },
  }
}
