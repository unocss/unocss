import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { IncomingMessage } from 'connect'
import type { UnocssPluginContext } from '@unocss/core'
import { toEscapedSelector } from '@unocss/core'

const _dirname = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url))

const DEVTOOLS_MODULE_ID = 'virtual:unocss-devtools'
const MOCK_CLASSES_MODULE_ID = 'virtual:unocss-mock-classes'
const MOCK_CLASSES_PATH = '/@unocss/mock-classes'
const DEVTOOLS_PATH = '/@unocss/devtools'
const DEVTOOLS_CSS_PATH = '/@unocss/devtools.css'

const devtoolCss = new Set<string>()

const MODULES_MAP: Record<string, string | undefined> = {
  [DEVTOOLS_MODULE_ID]: DEVTOOLS_PATH,
  [MOCK_CLASSES_MODULE_ID]: MOCK_CLASSES_PATH,
}

const POST_PATH = '/@unocss-devtools-update'

function getBodyJson(req: IncomingMessage) {
  return new Promise<any>((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('error', reject)
    req.on('end', () => {
      try {
        resolve(JSON.parse(body) || {})
      }
      catch (e) {
        reject(e)
      }
    })
  })
}

export function createDevtoolsPlugin(ctx: UnocssPluginContext): Plugin[] {
  let config: ResolvedConfig
  let server: ViteDevServer | undefined
  let clientCode = ''
  let devtoolTimer: any
  let lastUpdate = Date.now()

  function toClass(name: string) {
    // css escape
    return `${toEscapedSelector(name)}{}`
  }

  function updateDevtoolClass() {
    clearTimeout(devtoolTimer)
    devtoolTimer = setTimeout(() => {
      lastUpdate = Date.now()
      if (!server)
        return
      const mod = server.moduleGraph.getModuleById(DEVTOOLS_CSS_PATH)
      if (!mod)
        return
      server.moduleGraph.invalidateModule(mod)
      server.ws.send({
        type: 'update',
        updates: [{
          acceptedPath: DEVTOOLS_CSS_PATH,
          path: DEVTOOLS_CSS_PATH,
          timestamp: lastUpdate,
          type: 'js-update',
        }],
      })
    }, 100)
  }

  async function getMockClassesInjector() {
    const suggest = Object.keys(ctx.uno.config.rulesStaticMap)
    const comment = '/* unocss CSS mock class names for devtools auto-completion */\n'
    const css = suggest.map(toClass).join('')
    return `
  const style = document.createElement('style')
  style.setAttribute('type', 'text/css')
  style.innerHTML = ${JSON.stringify(comment + css)}
  document.head.prepend(style)
  `
  }

  return [
    {
      name: 'unocss:devtools',

      configResolved(_config) {
        config = _config
      },

      configureServer(_server) {
        server = _server

        server.middlewares.use(async (req, res, next) => {
          if (req.url !== POST_PATH)
            return next()

          try {
            const data = await getBodyJson(req)
            const type = data?.type
            let changed = false
            switch (type) {
              case 'add-classes':
                (data.data as string[]).forEach((key) => {
                  if (!devtoolCss.has(key)) {
                    devtoolCss.add(key)
                    changed = true
                  }
                })
                if (changed)
                  updateDevtoolClass()
            }
            res.statusCode = 200
          }
          catch (e) {
            console.error(e)
            res.statusCode = 500
          }

          res.end()
        })
      },

      resolveId(id) {
        if (id === DEVTOOLS_CSS_PATH)
          return DEVTOOLS_CSS_PATH
        return MODULES_MAP[id]
      },

      async load(id) {
        if (id === DEVTOOLS_PATH) {
          if (!clientCode) {
            clientCode = [
              await fs.promises.readFile(resolve(_dirname, 'client.mjs'), 'utf-8'),
              `import('${MOCK_CLASSES_MODULE_ID}')`,
              `import('${DEVTOOLS_CSS_PATH}')`,
            ]
              .join('\n')
              .replace('__POST_PATH__', (config.server?.origin ?? '') + POST_PATH)
          }
          return config.command === 'build'
            ? ''
            : clientCode
        }
        else if (id === MOCK_CLASSES_PATH) {
          return await getMockClassesInjector()
        }
        else if (id === DEVTOOLS_CSS_PATH) {
          const { css } = await ctx.uno.generate(devtoolCss)
          return css
        }
      },
    },
  ]
}
