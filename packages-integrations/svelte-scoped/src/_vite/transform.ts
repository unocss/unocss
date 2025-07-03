import type { UnoGenerator } from '@unocss/core'
import type { Plugin, ViteDevServer } from 'vite'
import type { SvelteScopedContext } from '../types'
import type { UnocssSvelteScopedViteOptions } from './types'
import { basename } from 'node:path'
import { RESOLVED_ID_RE, RESOLVED_ID_WITH_QUERY_RE, VIRTUAL_ENTRY_ALIAS } from '#integration/constants'
import { defaultPipelineExclude } from '#integration/defaults'
import { getHash } from '#integration/hash'
import { resolveId, resolveLayer } from '#integration/layers'
import { getPath } from '#integration/utils'
import MagicString from 'magic-string'
import { transformClasses } from '../_common/transformClasses/index.js'
import { checkForApply, transformStyle } from '../_common/transformStyle'
import { themeRE } from '../_common/transformTheme'

// from svelte/compiler/preprocess
const regexStyleTags
	// eslint-disable-next-line regexp/no-dupe-disjunctions
	= /<style((?:\s+[^=>'"/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"/\s]+)*\s*)(?:\/>|>([\s\S]*?)<\/style>)/g
const regexScriptTags
	// eslint-disable-next-line regexp/no-dupe-disjunctions
	= /<script((?:\s+[^=>'"/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"/\s]+)*\s*)(?:\/>|>([\s\S]*?)<\/script>)/g

export function transformPlugin(context: SvelteScopedContext, options: UnocssSvelteScopedViteOptions): Plugin {
  const servers: ViteDevServer[] = []
  const vfsLayers = new Map<string, string>()
  const idToEntryMapping = new Map<string, string>()

  return {
    name: 'unocss:svelte-scoped:transform',
    enforce: 'pre',

    configureServer(server) {
      servers.push(server)
    },

    async configResolved({ command }) {
      if (options.combine === undefined)
        options.combine = command === 'build'

      await context.ready
    },

    transform: {
      filter: {
        id: {
          include: /\.svelte$/,
          exclude: defaultPipelineExclude,
        },
      },

      order: 'pre',

      async handler(code, id) {
        // Fallback for old vite versions.
        if (!id.endsWith('.svelte'))
          return

        const s = new MagicString(code)

        // Transform styles first to not get confused later on.
        await transformStyleTag(s, context.uno, options)

        await transformMarkup(s, id, context.uno, options, (module, layer, css) => {
          const entry = idToEntryMapping.get(module)
          if (entry) {
            for (const server of servers) {
              const mod = server.moduleGraph.getModuleById(entry)
              if (mod) {
                server.moduleGraph.invalidateModule(mod)

                server.ws.send({
                  type: 'update',
                  updates: [{
                    acceptedPath: mod.url,
                    path: mod.url,
                    timestamp: Date.now(),
                    type: 'js-update',
                  }],
                })
              }
            }
          }

          vfsLayers.set(layer, css)
        })

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true, source: id }),
        }
      },
    },

    resolveId: {
      filter: {
        id: {
          include: VIRTUAL_ENTRY_ALIAS,
        },
      },

      handler(source, importer) {
        const entry = resolveId(source, importer)

        if (entry) {
          idToEntryMapping.set(source, entry)

          return {
            id: entry,
            moduleSideEffects: false,
          }
        }
      },
    },

    load: {
      filter: {
        id: {
          include: [RESOLVED_ID_RE, RESOLVED_ID_WITH_QUERY_RE],
        },
      },

      handler(id) {
        const layer = resolveLayer(getPath(id))

        if (layer) {
          const css = vfsLayers.get(layer)

          if (css) {
            return {
              code: css,
              map: null,
              moduleSideEffects: false,
            }
          }

          this.warn(`[svelte-scoped] virtual module ${id} was requested but not generated`)
        }
      },
    },
  }
}

async function transformStyleTag(s: MagicString, uno: UnoGenerator, options: UnocssSvelteScopedViteOptions) {
  const matches = s.original.matchAll(regexStyleTags)

  for (const { index, '0': tag_with_content, '2': content } of matches) {
    const { hasApply, applyVariables } = checkForApply(content, options.applyVariables)
    const hasThemeFn = options.transformThemeDirective === false
      ? false
      : !!content.match(themeRE)

    if (!hasApply && !hasThemeFn)
      continue

    const ss = new MagicString(content)

    await transformStyle({
      s: ss,
      uno,
      prepend: '',
      applyVariables,
      transformThemeFn: hasThemeFn,
    })

    const idx = index + tag_with_content.indexOf(content)

    s.update(idx, idx + content.length, ss.toString())
  }
}

async function transformMarkup(s: MagicString, filename: string, uno: UnoGenerator, options: UnocssSvelteScopedViteOptions, setCss: (module: string, layer: string, css: string) => void) {
  const transformed = await transformClasses({ s, filename, uno, options, removeCommentsToMakeGlobalWrappingEasy: false })

  if (!transformed)
    return

  const layer = `${basename(filename, '.svelte')}_${getHash(filename)}.svelte`
  const module = `uno:${layer}.css`
  const importStmt = `import '${module}';`

  setCss(module, layer, transformed.generatedStyles)

  const matches = s.original.matchAll(regexScriptTags)

  for (const { index, '0': tag_with_content, '1': attributes, '2': content } of matches) {
    if (attributes.includes('module'))
      continue

    const idx = index + tag_with_content.indexOf(content)

    s.prependLeft(idx, `${importStmt}\n`)
    return
  }

  // Did not find a script tag.
  s.prepend(`<script>\n${importStmt}\n</script>\n`)
}
