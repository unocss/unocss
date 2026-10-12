import type { InspectorChanges, ModuleInfo, OverviewInfo, ProjectInfo, ReplResult } from '../packages-integrations/inspector/types'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import { describe, expect, it } from 'vitest'
import { createContext } from '#integration/context'
import { analyzer } from '../packages-integrations/inspector/src/analyzer'
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
    const getOverview = createRpcFunctions(ctx).find(fn => fn.name === 'get-overview')!
    const handler = await resolveHandler(getOverview)
    const overview: OverviewInfo = await handler()

    expect(overview.css).toContain('text-red')
    expect(overview.gzipSize).toBeGreaterThan(0)
    expect(overview.matched.map(i => i.name)).toContain('m-4')
    expect(overview.layers.map(i => i.name)).toContain('default')
  })

  it('identifies icon collections with custom prefixes and hyphenated names', async () => {
    const ctx = createContext({
      presets: [
        presetIcons({
          prefix: 'icon-',
          layer: 'pictograms',
          collections: {
            'my-icons': {
              star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>',
              moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
            },
          },
        }),
        presetWind3(),
      ],
    })
    await ctx.ready
    await ctx.extract('<div class="icon-my-icons-star hover:icon-my-icons-star icon-my-icons:moon icon-mdi:home" />', MODULE_ID)
    await ctx.flushTasks()

    const overview = await analyzer(ctx.modules, ctx)

    expect(overview.icons.map(icon => [icon.baseSelector, icon.collection])).toEqual(expect.arrayContaining([
      ['icon-my-icons-star', 'my-icons'],
      ['icon-my-icons:moon', 'my-icons'],
      ['icon-mdi:home', 'mdi'],
    ]))
    expect(overview.icons.find(icon => icon.baseSelector === 'icon-my-icons-star')?.count).toBe(2)
  })

  it('identifies collections for default icon syntax', async () => {
    const ctx = createContext({ presets: [presetIcons(), presetWind3()] })
    await ctx.ready
    await ctx.extract('<div class="i-mdi-home i-carbon-sun i-vscode-icons:file-type-light-pnpm" />', MODULE_ID)
    await ctx.flushTasks()

    const overview = await analyzer(ctx.modules, ctx)
    expect(overview.icons.map(icon => [icon.baseSelector, icon.collection])).toEqual(expect.arrayContaining([
      ['i-carbon-sun', 'carbon'],
      ['i-mdi-home', 'mdi'],
      ['i-vscode-icons:file-type-light-pnpm', 'vscode-icons'],
    ]))
  })

  it('does not assign one collection to a shortcut containing multiple icons', async () => {
    const ctx = createContext({
      presets: [presetIcons(), presetWind3()],
      shortcuts: { logos: 'i-carbon-sun i-mdi-home' },
    })
    await ctx.ready
    await ctx.extract('<div class="logos" />', MODULE_ID)
    await ctx.flushTasks()

    const overview = await analyzer(ctx.modules, ctx)
    expect(overview.icons.some(icon => icon.rawSelector === 'logos')).toBe(false)
  })

  it('aggregates utilities, colors, and icon variants across modules', async () => {
    const ctx = createContext({ details: true, presets: [presetIcons(), presetWind3()] })
    const secondModule = '/root/playground/Other.vue'
    await ctx.ready
    await ctx.extract('<div class="text-red-500 i-mdi-home hover:i-mdi-home" />', MODULE_ID)
    await ctx.extract('<div class="text-red-500 i-mdi-home" />', secondModule)
    await ctx.flushTasks()

    const result = await analyzer(ctx.modules, ctx)
    expect(result.matched.find(item => item.name === 'text-red-500')?.count).toBe(2)
    expect(result.colors.find(item => item.name === 'red')?.count).toBe(2)
    expect(result.icons).toHaveLength(1)
    expect(result.icons[0].count).toBe(3)
    expect(result.icons[0].modules).toEqual([MODULE_ID, secondModule])
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
            sharedState: async () => ({ mutate: () => {}, value: () => ({}), on: () => {} }),
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
      'get-autocomplete-suggestions',
      'get-generated-css',
      'get-overview',
    ])
  })

  it('signals changes through the shared state of every mounted host', async () => {
    const ctx = await prepareContext()
    const inspector = createInspectorDevframe(ctx)

    const mutations: InspectorChanges[] = []
    const state = {
      value: () => ({ revision: 0, module: '' }),
      on: () => {},
      mutate: (fn: (s: InspectorChanges) => void) => {
        const next = mutations.at(-1) ?? { revision: 0, module: '' }
        const draft = { ...next }
        fn(draft)
        mutations.push(draft)
      },
    }
    const host = {
      scope: () => ({
        rpc: {
          register: () => {},
          sharedState: async () => state,
        },
      }),
    } as any

    await inspector.definition.setup(host)

    inspector.notifyModuleUpdated({ path: MODULE_ID })
    inspector.notifyConfigChanged()
    inspector.notifyInvalidated()

    // Every notification bumps the revision; module updates carry the path
    expect(mutations.map(m => m.revision)).toEqual([1, 2, 3])
    expect(mutations[0].module).toBe(MODULE_ID)
    expect(mutations[1].module).toBe('')
  })
})
