import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { Plugin, ResolvedConfig, Rollup, Update, ViteDevServer } from 'vite'
import type { VitePluginConfig } from '../types'
import { LAYER_MARK_ALL } from '#integration/constants'
import { defaultPipelineExclude } from '#integration/defaults'
import { getHash } from '#integration/hash'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath } from '#integration/utils'
import { notNull } from '@unocss/core'
import MagicString from 'magic-string'
import { createFilter } from 'unplugin-utils'

const regexScriptTags
  // eslint-disable-next-line regexp/no-dupe-disjunctions
  = /(?<!<!--\s*)<script(?:\s+[^=>'"/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"/\s]+)*\s*(?:\/>|>([\s\S]*?)<\/script>)(?!\s*-->)/g
const virtualModuleCSS = 'uno.css'
const importStmt = `import "${virtualModuleCSS}";`
const WS_EVENT_PREFIX = 'unocss:hmr'
const HASH_LENGTH = 6

export function VueScopedPlugin(ctx: UnocssPluginContext): Plugin[] {
  let filter = createFilter([/\.vue$/], defaultPipelineExclude)
  let globalLayers: string[] = []
  let viteConfig: ResolvedConfig
  let cssPostPlugin: Plugin | undefined
  const servers: ViteDevServer[] = []
  const entries = new Set<string>()
  const lastServedHash = new Map<string, string>()
  let lastServedTime = Date.now()

  async function generateCSS(layer: string) {
    await ctx.flushTasks()
    let result: GenerateResult
    let tokensSize = ctx.tokens.size

    while (true) {
      result = await ctx.uno.generate(ctx.tokens)
      if (tokensSize === ctx.tokens.size)
        break
      tokensSize = ctx.tokens.size
    }

    const css = layer === LAYER_MARK_ALL
      ? result.getLayers(globalLayers)
      : result.getLayer(layer)

    const hash = getHash(css || '', HASH_LENGTH)
    lastServedHash.set(layer, hash)
    lastServedTime = Date.now()
    return { hash, css }
  }

  function insertImport(code: string) {
    const s = new MagicString(code)
    const matches = [...s.original.matchAll(regexScriptTags)]

    if (matches.length === 0) {
      s.prepend(`<script>${importStmt}</script>`)
    }
    else {
      for (const match of matches) {
        const [scriptBlock, content] = match
        const index = match.index!
        if (scriptBlock) {
          if (content) {
            const idx = index + scriptBlock.indexOf(content)
            s.prependLeft(idx, importStmt)
          }
          else {
            const isSelfClosing = scriptBlock.endsWith('/>')
            if (isSelfClosing) {
              const idx = index + scriptBlock.indexOf('/>')
              s.overwrite(idx - 1, idx + 1, `>${importStmt}</script>`)
            }
            else {
              const idx = index + scriptBlock.indexOf('>') + 1
              s.prependLeft(idx, importStmt)
            }
          }
          break
        }
      }
    }

    return s.toString()
  }

  async function transformSFC(code: string, id: string) {
    await ctx.ready

    ctx.tasks.push(ctx.extract(code, id))
    const { css, getLayers } = await ctx.uno.generate(code)
    if (!css)
      return null

    return [
      insertImport(code),
      `<style scoped>${getLayers(undefined, globalLayers)}</style>`,
    ].join('\n')
  }

  function sendUpdate(ids: Set<string> = entries) {
    for (const server of servers) {
      server.ws.send({
        type: 'update',
        updates: Array.from(ids)
          .map((id) => {
            const mod = server.moduleGraph.getModuleById(id)
            if (!mod)
              return null
            server.moduleGraph.invalidateModule(mod)
            return {
              acceptedPath: mod.url,
              path: mod.url,
              timestamp: lastServedTime,
              type: 'js-update',
            } as Update
          })
          .filter(notNull),
      })
    }
  }

  return [
    {
      name: 'unocss:vue-scoped',
      enforce: 'pre',
      configureServer(_server) {
        servers.push(_server)

        _server.ws.on(WS_EVENT_PREFIX, async ([layer]: string[]) => {
          const preHash = lastServedHash.get(layer)
          const { hash } = await generateCSS(layer)
          if (hash !== preHash)
            sendUpdate()
        })
      },
      async configResolved(_config) {
        viteConfig = _config
        const { config } = await ctx.ready

        const layersOrder = ctx.uno.config.layers
        globalLayers = ctx.uno.config.preflights
          .map(p => p.layer)
          .filter(notNull)
          .sort((a, b) =>
            layersOrder[a] - layersOrder[b])

        filter = config.content?.pipeline === false
          ? () => false
          : createFilter(
              config.content?.pipeline?.include ?? [/\.vue$/],
              config.content?.pipeline?.exclude ?? defaultPipelineExclude,
            )
      },
      resolveId(id) {
        const entry = resolveId(id)
        if (entry) {
          entries.add(entry)
          return entry
        }
      },
      async load(id) {
        const layer = resolveLayer(getPath(id))
        if (!layer)
          return null

        const { hash, css } = await generateCSS(layer)
        if (css) {
          return {
            // add hash to the chunk of CSS that it will send back to client to check if there is new CSS generated
            code: `${css}__uno_hash_${hash}{--:'';}`,
            map: { mappings: '' },
          }
        }
        this.warn(`[unocss] virtual module ${id} was requested but not generated`)
      },
      async transform(code, id) {
        if (!filter(id) || !id.endsWith('.vue'))
          return

        const css = await transformSFC(code, id)

        if (css) {
          return {
            code: css,
            map: null,
          }
        }
      },
      handleHotUpdate(ctx) {
        const read = ctx.read
        if (filter(ctx.file)) {
          ctx.read = async () => {
            const code = await read()
            return await transformSFC(code, ctx.file) || code
          }
        }
      },
      buildStart() {
        entries.clear()
        lastServedHash.clear()
        ctx.tasks.length = 0
      },
      async renderChunk(_code, chunk) {
        if (viteConfig.command !== 'build')
          return null

        const vueModules = Object.entries(chunk.modules).filter(([id]) => filter(id))

        const virtualCSSEntry = resolveId(virtualModuleCSS)
        if (vueModules.length > 0 && virtualCSSEntry && entries.has(virtualCSSEntry)) {
          cssPostPlugin = viteConfig.plugins.find(i => i.name === 'vite:css-post')
          if (!cssPostPlugin) {
            this.warn('[vue-scoped] failed to find vite:css-post plugin. It might be an internal bug of UnoCSS')
            return null
          }

          for (const [moduleId, moduleInfo] of vueModules) {
            if (moduleInfo && typeof moduleInfo.code === 'string') {
              ctx.tasks.push(ctx.extract(moduleInfo.code, moduleId))
            }
          }

          await ctx.flushTasks()

          if (ctx.tokens.size > 0) {
            const { getLayers } = await ctx.uno.generate(ctx.tokens)
            const globalStyles = getLayers(globalLayers)

            if (virtualCSSEntry && cssPostPlugin?.transform) {
              const transformHandler = typeof cssPostPlugin.transform === 'object' && 'handler' in cssPostPlugin.transform
                ? cssPostPlugin.transform.handler
                : cssPostPlugin.transform
              await transformHandler.call(this as Rollup.TransformPluginContext, globalStyles, virtualCSSEntry)
            }
          }
        }
      },
    },
    {
      name: 'unocss:global:post',
      apply(config, env) {
        return env.command === 'serve' && !config.build?.ssr
      },
      enforce: 'post',
      async transform(code, id) {
        const layer = resolveLayer(getPath(id))

        // inject css modules to send callback on css load
        if (layer && code.includes('import.meta.hot')) {
          let hmr = `
try {
  let hash = __vite__css.match(/__uno_hash_(\\w{${HASH_LENGTH}})/)
  hash = hash && hash[1]
  if (!hash)
    console.warn('[unocss-hmr]', 'failed to get unocss hash, hmr might not work')
  else
    await import.meta.hot.send('${WS_EVENT_PREFIX}', ['${layer}'])
} catch (e) {
  console.warn('[unocss-hmr]', e)
}
if (!import.meta.url.includes('?'))
  await new Promise(resolve => setTimeout(resolve, 10))`

          const config = await ctx.getConfig() as VitePluginConfig

          if (config.hmrTopLevelAwait === false)
            hmr = `;(async function() {${hmr}\n})()`
          hmr = `\nif (import.meta.hot) {${hmr}}`

          const s = new MagicString(code)
          s.append(hmr)

          return {
            code: s.toString(),
            map: s.generateMap() as any,
          }
        }
      },
    },
  ]
}
