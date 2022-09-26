import { fileURLToPath } from 'url'
import { dirname, resolve } from 'pathe'
import sirv from 'sirv'
import type { Plugin, ViteDevServer } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import gzipSize from 'gzip-size'
import type { ModuleInfo, ProjectInfo } from '../types'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export default function UnocssInspector(ctx: UnocssPluginContext): Plugin {
  async function configureServer(server: ViteDevServer) {
    await ctx.ready

    server.middlewares.use('/__unocss', sirv(resolve(_dirname, '../dist/client'), {
      single: true,
      dev: true,
    }))

    server.middlewares.use('/__unocss_api', async (req, res, next) => {
      if (!req.url)
        return next()
      if (req.url === '/') {
        const info: ProjectInfo = {
          version: ctx.uno.version,
          // use the resolved config from the dev server
          root: server.config.root,
          modules: Array.from(ctx.modules.keys()),
          config: ctx.uno.config,
          configSources: (await ctx.ready).sources,
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
        const includeSafelist = JSON.parse(query.get('safelist') ?? 'false')

        const result = await ctx.uno.generate(token, { preflights: false, safelist: includeSafelist })
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
    configureServer,
  }
}
