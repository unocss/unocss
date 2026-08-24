import type { ModuleInfo, OverviewInfo, ProjectInfo, ReplResult } from '../packages-integrations/inspector/types'
import presetWind3 from '@unocss/preset-wind3'
import { describe, expect, it } from 'vitest'
import { createContext } from '#integration/context'
import { createInspectorDevframe } from '../packages-integrations/inspector/src/devframe'
import { createRpcFunctions } from '../packages-integrations/inspector/src/rpc'

const MODULE_ID = '/root/playground/App.vue'
const MODULE_CODE = '<div class="text-red m-4 hover:op50">Hello</div>'

async function prepareContext() {
  const ctx = createContext({
    presets: [
      presetWind3(),
    ],
  })
  await ctx.ready
  await ctx.extract(MODULE_CODE, MODULE_ID)
  await ctx.flushTasks()
  return ctx
}

async function resolveHandler(def: any) {
  const setup = await def.setup?.(undefined)
  return (setup?.handler ?? def.handler)!
}

describe('inspector rpc', () => {
  it('get-project-info returns a JSON-safe project snapshot', async () => {
    const ctx = await prepareContext()
    const [getProjectInfo] = createRpcFunctions(ctx)
    const handler = await resolveHandler(getProjectInfo)
    const info: ProjectInfo = await handler()

    expect(info.version).toBeTypeOf('string')
    expect(info.modules).toContain(MODULE_ID)
    expect(info.config.presets?.length).toBeGreaterThan(0)
    // Must survive strict JSON serialization (sent over the wire and
    // baked into static dumps)
    expect(() => JSON.stringify(info)).not.toThrow()
  })

  it('get-module-info analyzes a single module', async () => {
    const ctx = await prepareContext()
    const [, getModuleInfo] = createRpcFunctions(ctx)
    const handler = await resolveHandler(getModuleInfo)
    const mod: ModuleInfo | null = await handler(MODULE_ID)

    expect(mod).not.toBeNull()
    expect(mod!.id).toBe(MODULE_ID)
    expect(mod!.code).toBe(MODULE_CODE)
    expect(mod!.css).toContain('text-red')
    expect(mod!.gzipSize).toBeGreaterThan(0)
    expect(mod!.matched.map(i => i.name)).toContain('text-red')
    expect(mod!.layers.length).toBeGreaterThan(0)
  })

  it('get-module-info returns null for unknown modules', async () => {
    const ctx = await prepareContext()
    const [, getModuleInfo] = createRpcFunctions(ctx)
    const handler = await resolveHandler(getModuleInfo)

    expect(await handler('/does/not/exist.vue')).toBeNull()
  })

  it('get-module-info declares a dump input per module', async () => {
    const ctx = await prepareContext()
    const [, getModuleInfo] = createRpcFunctions(ctx)
    const dump = await (getModuleInfo.dump as any)()

    expect(dump.inputs).toEqual([[MODULE_ID]])
    expect(dump.fallback).toBeNull()
  })

  it('generate-repl generates CSS for arbitrary input', async () => {
    const ctx = await prepareContext()
    const [, , generateRepl] = createRpcFunctions(ctx)
    const handler = await resolveHandler(generateRepl)
    const result: ReplResult = await handler('text-blue p-2', false)

    expect(result.css).toContain('text-blue')
    expect(result.matched).toContain('text-blue')
    expect(result.matched).toContain('p-2')
  })

  it('get-overview aggregates the whole project', async () => {
    const ctx = await prepareContext()
    const [, , , getOverview] = createRpcFunctions(ctx)
    const handler = await resolveHandler(getOverview)
    const overview: OverviewInfo = await handler()

    expect(overview.css).toContain('text-red')
    expect(overview.gzipSize).toBeGreaterThan(0)
    expect(overview.matched.map(i => i.name)).toContain('m-4')
    expect(overview.layers.map(i => i.name)).toContain('default')
  })
})

describe('inspector devframe', () => {
  it('registers the rpc functions under the unocss scope', async () => {
    const ctx = await prepareContext()
    const inspector = createInspectorDevframe(ctx)

    expect(inspector.definition.id).toBe('unocss')
    expect(inspector.definition.basePath).toBe('/__unocss/')

    const registered: string[] = []
    const scopes: string[] = []
    const host = {
      scope: (ns: string) => {
        scopes.push(ns)
        return {
          rpc: {
            register: (fn: any) => {
              registered.push(fn.name)
            },
            broadcast: async () => {},
          },
        }
      },
    } as any

    await inspector.definition.setup(host)

    expect(scopes).toContain('unocss')
    expect(registered).toEqual([
      'get-project-info',
      'get-module-info',
      'generate-repl',
      'get-overview',
    ])
  })

  it('broadcasts change notifications to every mounted host', async () => {
    const ctx = await prepareContext()
    const inspector = createInspectorDevframe(ctx)

    const broadcasts: any[] = []
    const host = {
      scope: () => ({
        rpc: {
          register: () => {},
          broadcast: async (options: any) => {
            broadcasts.push(options)
          },
        },
      }),
    } as any

    await inspector.definition.setup(host)

    inspector.notifyModuleUpdated({ path: MODULE_ID })
    inspector.notifyConfigChanged()
    inspector.notifyInvalidated()

    expect(broadcasts.map(i => i.method)).toEqual([
      'on-module-updated',
      'on-config-changed',
      'on-invalidated',
    ])
    expect(broadcasts[0].args).toEqual([{ path: MODULE_ID }])
  })
})
