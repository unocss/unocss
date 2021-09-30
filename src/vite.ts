import { createHash } from 'crypto'
import { Plugin, ViteDevServer } from 'vite'
import { createGenerator, defaultConfig, NanowindConfig } from '.'

function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

const VIRTUAL_PREFIX = '/@virtual/nanowind/'

export default function NanowindVitePlugin(config: NanowindConfig = defaultConfig): Plugin {
  const generate = createGenerator(config)
  const map = new Map<string, [string, string]>()
  let server: ViteDevServer | undefined

  const invalidate = (hash: string) => {
    if (!server)
      return
    const id = `${VIRTUAL_PREFIX}${hash}.css`
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
    name: 'nanowind',
    enforce: 'post',
    configureServer(_server) {
      server = _server
    },
    transform(code, id) {
      if (id.endsWith('.css'))
        return null

      const style = generate(code)
      if (!style)
        return null

      const hash = getHash(id)
      map.set(hash, [id, style])
      invalidate(hash)

      return `import "${VIRTUAL_PREFIX}${hash}.css";${code}`
    },
    resolveId(id) {
      return id.startsWith(VIRTUAL_PREFIX) ? id : null
    },
    load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX))
        return null

      const hash = id.slice(VIRTUAL_PREFIX.length, -'.css'.length)

      const [source, css] = map.get(hash) || []

      if (source)
        this.addWatchFile(source)

      return `\n/* nanowind ${source} */\n${css}`
    },
  }
}
