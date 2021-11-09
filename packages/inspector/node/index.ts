import { resolve } from 'path'
import sirv from 'sirv'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { UnocssPluginContext } from '@unocss/vite'
import gzipSize from 'gzip-size'
import { ModuleInfo, ProjectInfo } from '../types'

export default function UnocssInspector(ctx: UnocssPluginContext): Plugin {
  let config: ResolvedConfig

  function configureServer(server: ViteDevServer) {
    server.middlewares.use('/__unocss', sirv(resolve(__dirname, '../dist/client'), {
      single: true,
      dev: true,
    }))

    server.middlewares.use('/__unocss_api', async(req, res, next) => {
      if (!req.url)
        return next()
      if (req.url === '/') {
        const info: ProjectInfo = {
          root: config.root,
          modules: Array.from(ctx.modules.keys()),
          configPath: ctx.configFilepath,
          config: ctx.uno.config,
        }
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(info, null, 2))
        res.end()
        return
      }

      if (req.url.startsWith('/module')) {
        const query = new URLSearchParams(req.url.slice(8))
        const id = query.get('id') || ''
        const code = ctx.modules.get(id)

        if (code == null) {
          res.statusCode = 404
          res.end()
          return
        }

        const result = await ctx.uno.generate(code, { id, preflights: false })
        const mod: ModuleInfo = {
          ...result,
          matched: Array.from(result.matched),
          gzipSize: await gzipSize(result.css),
          code,
          id,
        }
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(mod, null, 2))
        res.end()
        return
      }

      if (req.url.startsWith('/repl')) {
        const query = new URLSearchParams(req.url.slice(5))
        const token = query.get('token') || ''

        const result = await ctx.uno.generate(token, { preflights: false })
        const mod = {
          ...result,
          matched: Array.from(result.matched),
        }
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(mod, null, 2))
        res.end()
        return
      }

      if (req.url.startsWith('/overview')) {
        const result = await ctx.uno.generate(ctx.tokens)
        const mod = {
          ...result,
          matched: Array.from(result.matched),
          gzipSize: await gzipSize(result.css),
        }
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(mod, null, 2))
        res.end()
        return
      }

      next()
    })
  }

  return <Plugin>{
    name: 'unocss:inspector',
    apply: 'serve',
    configResolved(_config) {
      config = _config
    },
    configureServer,
  }
}
