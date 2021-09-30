import { createHash } from 'crypto'
import type { Plugin, ViteDevServer } from 'vite'
import { FilterPattern, createFilter } from '@rollup/pluginutils'
import { resolveConfig } from './options'
import { createGenerator, NanowindUserConfig } from '.'

export interface NanowindUserOptions extends NanowindUserConfig {
  include?: FilterPattern
  exclude?: FilterPattern
}

function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

const VIRTUAL_PREFIX = '/@nanowind/'

export default function NanowindVitePlugin(config: NanowindUserOptions = {}): Plugin {
  const resolved = resolveConfig(config)
  const generate = createGenerator(resolved)
  const map = new Map<string, [string, string]>()
  let server: ViteDevServer | undefined

  const filter = createFilter(
    config.include || [/\.vue$/, /\.vue?vue/, /\.svelte$/, /\.[jt]sx?$/],
    config.exclude || [/[\/\\]node_modules[\/\\]/, /[\/\\]dist[\/\\]/],
  )

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
      if (id.endsWith('.css') || !filter(id))
        return

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
