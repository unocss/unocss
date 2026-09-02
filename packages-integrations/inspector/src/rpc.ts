import type { UnocssPluginContext } from '@unocss/core'
import type { RpcDefinitionsToFunctionsWithNamespace } from 'devframe/rpc'
import type { ModuleInfo, OverviewInfo, ProjectInfo, ReplResult } from '../types'
import { BetterMap, CountableSet } from '@unocss/core'
import { defineRpcFunction } from 'devframe/rpc'
import gzipSize from 'gzip-size'
import { SKIP_COMMENT_RE } from '#integration/constants'
import { analyzer } from './analyzer'

export const INSPECTOR_RPC_SCOPE = 'unocss'

/**
 * Create the inspector's server RPC functions, closing over the UnoCSS
 * plugin context. Registered under the `unocss` scope on every devframe
 * host that mounts the inspector.
 */
export function createRpcFunctions(ctx: UnocssPluginContext) {
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
          gzipSize: await gzipSize(result.css),
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
          gzipSize: await gzipSize(result.css),
        }
      },
    }),
  })

  return [
    getProjectInfo,
    getModuleInfo,
    generateRepl,
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
