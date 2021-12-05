import type { Plugin, ViteDevServer } from 'vite'
import { UnocssPluginContext, getHash } from '../../../plugins-common'

const VIRTUAL_PREFIX = '/@unocss/'
const SCOPE_IMPORT_RE = new RegExp(`\\s+from\\s+['"](${VIRTUAL_PREFIX}(.*))['"]`, 'i')

export function ShadowDomModuleModePlugin({ uno, filter }: UnocssPluginContext): Plugin {
  const moduleMap = new Map<string, [string, string]>()
  let server: ViteDevServer | undefined

  const invalidate = (id: string) => {
    if (!server)
      return
    const mod = server.moduleGraph.getModuleById(id)
    if (!mod)
      return
    server.moduleGraph.invalidateModule(mod)
    server.ws.send({
      type: 'update',
      updates: [{
        acceptedPath: id,
        path: id,
        timestamp: +Date.now(),
        type: 'js-update',
      }],
    })
  }

  return {
    name: 'unocss:shadow-dom',
    enforce: 'post',
    configureServer(_server) {
      server = _server
    },
    async transform(code, id) {
      if (!filter(code, id))
        return

      const hash = getHash(id)

      const { css } = await uno.generate(code, { id, preflights: false })
      if (!css)
        return null

      const imported = code.match(SCOPE_IMPORT_RE)
      if (!imported)
        return null

      const useId = `${VIRTUAL_PREFIX}${hash}.css`

      moduleMap.set(hash, [id, css])
      invalidate(useId)

      let idx = code.indexOf(useId)
      const useCode = idx > -1 ? code.slice(idx + useId.length + 1) : code
      idx = useCode.indexOf(imported[1])
      return {
        code: `${useCode.slice(0, idx)}${useId}${useCode.slice(idx + imported[1].length)}`,
        map: null,
      }
    },
    resolveId(id) {
      return id.startsWith(VIRTUAL_PREFIX) ? id : null
    },
    load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX))
        return null

      const hash = id.slice(VIRTUAL_PREFIX.length, -'.css'.length)

      const [source, css] = moduleMap.get(hash) || []

      if (source)
        this.addWatchFile(source)

      return `\n/* unocss ${source} */\n${css}`
    },
  }
}
