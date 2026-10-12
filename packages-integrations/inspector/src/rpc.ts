import type { UnocssPluginContext } from '@unocss/core'
import type { RpcDefinitionsToFunctionsWithNamespace } from 'devframe/rpc'
import type { ModuleInfo, OverviewInfo, ProjectInfo, ReplResult } from '../types'
import { gzipSync } from 'node:zlib'
import { createAutocomplete } from '@unocss/autocomplete'
import { BetterMap, CountableSet } from '@unocss/core'
import { getCSS } from '@unocss/language-server'
import { defineRpcFunction } from 'devframe/rpc'
import { SKIP_COMMENT_RE } from '#integration/constants'
import { analyzer } from './analyzer'

export const INSPECTOR_RPC_SCOPE = 'unocss'

/**
 * Create the inspector's server RPC functions, closing over the UnoCSS
 * plugin context. Registered under the `unocss` scope on every devframe
 * host that mounts the inspector.
 */
export function createRpcFunctions(ctx: UnocssPluginContext) {
  let autocomplete: ReturnType<typeof createAutocomplete> | undefined
  let autocompleteConfig: UnocssPluginContext['uno']['config'] | undefined
  const generatedCssCache = new Map<string, string>()

  function getAutocomplete() {
    if (!autocomplete || autocompleteConfig !== ctx.uno.config) {
      autocomplete = createAutocomplete(ctx.uno)
      autocompleteConfig = ctx.uno.config
    }
    return autocomplete
  }

  ctx.onReload(() => {
    autocomplete = undefined
    autocompleteConfig = undefined
    generatedCssCache.clear()
  })

  const getProjectInfo = defineRpcFunction({
    name: 'get-project-info',
    type: 'query',
    // Bake a single snapshot into static builds
    snapshot: true,
    setup: () => ({
      handler: async (): Promise<ProjectInfo> => {
        const { sources } = await ctx.ready
        const info: ProjectInfo = {
          version: ctx.uno.version,
          root: ctx.root,
          modules: Array.from(ctx.modules.keys()),
          config: ctx.uno.config,
          configSources: sources,
        }
        // The resolved config carries functions, regexes and circular
        // references — strip it down to the JSON view the UI consumes.
        return JSON.parse(JSON.stringify(info, getCircularReplacer()))
      },
    }),
  })

  const getModuleInfo = defineRpcFunction({
    name: 'get-module-info',
    type: 'query',
    setup: () => ({
      handler: async (id: string): Promise<ModuleInfo | null> => {
        await ctx.ready
        const code = ctx.modules.get(id)

        if (code == null)
          return null

        const tokens = new CountableSet<string>()
        await ctx.uno.applyExtractors(code.replace(SKIP_COMMENT_RE, ''), id, tokens)

        const result = await ctx.uno.generate(tokens, { id, extendedInfo: true, preflights: false })
        const analyzed = await analyzer(new BetterMap([[id, code]]), ctx)

        return {
          ...analyzed,
          css: result.css,
          layers: result.layers.map(name => ({ name, css: result.getLayer(name)! })),
          gzipSize: gzipSync(result.css).byteLength,
          code,
          id,
        }
      },
    }),
    // Pre-compute every known module for static builds
    dump: () => ({
      inputs: Array.from(ctx.modules.keys()).map(id => [id] as [string]),
      fallback: null,
    }),
  })

  const generateRepl = defineRpcFunction({
    name: 'generate-repl',
    type: 'query',
    setup: () => ({
      handler: async (input: string, includeSafelist: boolean): Promise<ReplResult> => {
        await ctx.ready
        const result = await ctx.uno.generate(input, { preflights: false, safelist: includeSafelist })
        return {
          css: result.css,
          matched: Array.from(result.matched),
        }
      },
    }),
    // The REPL cannot run against a static dump — degrade gracefully
    dump: {
      fallback: { css: '/* The REPL requires a live UnoCSS dev server */', matched: [] } as unknown as Promise<ReplResult>,
    },
  })

  const getAutocompleteSuggestions = defineRpcFunction({
    name: 'get-autocomplete-suggestions',
    type: 'query',
    setup: () => ({
      handler: async (content: string, cursor: number) => {
        await ctx.ready
        const result = await getAutocomplete().suggestInFile(content, cursor)
        if (!result?.suggestions.length)
          return null

        const resolved = result.resolveReplacement(result.suggestions[0][0])
        return {
          from: resolved.start,
          options: result.suggestions.map(([value, label]) => ({
            label,
            apply: value,
            type: 'text',
            boost: 99,
          })),
        }
      },
    }),
    dump: { fallback: null },
  })

  const getGeneratedCss = defineRpcFunction({
    name: 'get-generated-css',
    type: 'query',
    setup: () => ({
      handler: async (token: string): Promise<string | null> => {
        await ctx.ready
        const cached = generatedCssCache.get(token)
        if (cached)
          return cached

        const css = await getCSS(ctx.uno, token)
        if (css)
          generatedCssCache.set(token, css)
        return css || null
      },
    }),
    dump: { fallback: null },
  })

  const getOverview = defineRpcFunction({
    name: 'get-overview',
    type: 'query',
    snapshot: true,
    setup: () => ({
      handler: async (): Promise<OverviewInfo> => {
        await ctx.ready
        const result = await ctx.uno.generate(ctx.tokens, { preflights: false })
        const analyzed = await analyzer(ctx.modules, ctx)

        return {
          ...analyzed,
          css: result.css,
          layers: result.layers.map(name => ({ name, css: result.getLayer(name)! })),
          gzipSize: gzipSync(result.css).byteLength,
        }
      },
    }),
  })

  return [
    getProjectInfo,
    getModuleInfo,
    generateRepl,
    getAutocompleteSuggestions,
    getGeneratedCss,
    getOverview,
  ] as const
}

export type InspectorServerFunctions = ReturnType<typeof createRpcFunctions>

declare module 'devframe' {
  interface DevframeRpcServerFunctions extends RpcDefinitionsToFunctionsWithNamespace<typeof INSPECTOR_RPC_SCOPE, InspectorServerFunctions> {}
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
