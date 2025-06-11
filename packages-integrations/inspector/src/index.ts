import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin, ViteDevServer } from 'vite'
import type { ModuleInfo, OverviewInfo, ProjectInfo } from '../types'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SKIP_COMMENT_RE } from '#integration/constants'
import { BetterMap, CountableSet } from '@unocss/core'
import { bold, cyan, green } from 'colorette'
import gzipSize from 'gzip-size'
import sirv from 'sirv'
import { analyzer } from './analyzer'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export default function UnocssInspector(ctx: UnocssPluginContext): Plugin {
  async function configureServer(server: ViteDevServer) {
    await ctx.ready
    const baseUrl = '__unocss'

    server.middlewares.use(`/${baseUrl}`, sirv(resolve(_dirname, '../dist/client'), {
      single: true,
      dev: true,
    }))

    server.middlewares.use(`/${baseUrl}_api`, async (req, res, next) => {
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
        res.write(JSON.stringify(info, getCircularReplacer(), 2))
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

        const tokens = new CountableSet<string>()
        await ctx.uno.applyExtractors(code.replace(SKIP_COMMENT_RE, ''), id, tokens)

        const result = await ctx.uno.generate(tokens, { id, extendedInfo: true, preflights: false })
        const analyzed = await analyzer(new BetterMap([[id, code]]), ctx)
        const mod: ModuleInfo = {
          ...result,
          ...analyzed,
          layers: result.layers.map(name => ({ name, css: result.getLayer(name)! })),
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
        const result = await ctx.uno.generate(ctx.tokens, { preflights: false })
        const analyzed = await analyzer(ctx.modules, ctx)

        const mod: OverviewInfo = {
          ...result,
          ...analyzed,
          gzipSize: await gzipSize(result.css),
          layers: result.layers.map(name => ({ name, css: result.getLayer(name)! })),
        }
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(mod, null, 2))
        res.end()
        return
      }

      next()
    })

    const _printUrls = server.printUrls
    const colorUrl = (url: string) =>
      cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))

    server.printUrls = () => {
      _printUrls()
      for (const localUrl of server.resolvedUrls?.local ?? []) {
        // server.config.base will be normalized with leading and trailing slashes,
        // but localUrl might not have a trailing slash
        const appUrl = localUrl.endsWith('/') ? localUrl : `${localUrl}/`
        // remove the base path from appUrl if possible
        const serverUrl = server.config.base && appUrl.endsWith(server.config.base)
          ? appUrl.slice(0, -server.config.base.length)
          : appUrl.slice(0, -1) // remove the trailing slash
        // we removed the trailing slash from serverUrl when removing the base, add it back
        const inspectorUrl = `${serverUrl}/${baseUrl}/`
        // eslint-disable-next-line no-console
        console.log(`  ${green('➜')}  ${bold('UnoCSS Inspector')}: ${colorUrl(`${inspectorUrl}`)}`)
      }
    }
  }

  return {
    name: 'unocss:inspector',
    apply: 'serve',
    configureServer,
  } as Plugin
}

function getCircularReplacer() {
  const ancestors: any = []
  return function (this: any, key: any, value: any) {
    if (typeof value !== 'object' || value === null)
      return value

    // `this` is the object that value is contained in,
    // i.e., its direct parent.
    while (ancestors.length > 0 && ancestors.at(-1) !== this)
      ancestors.pop()

    if (ancestors.includes(value))
      return '[Circular]'

    ancestors.push(value)
    return value
  }
}
