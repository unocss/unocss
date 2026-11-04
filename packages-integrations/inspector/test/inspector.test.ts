import type { DocsItem, DocsSearchItem, InspectorChanges, ModuleInfo, OverviewInfo, ProjectInfo, ReplResult } from '../types'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { createContext } from '#integration/context'
import { analyzer } from '../src/analyzer'
import { createInspectorDevframe } from '../src/devframe'
import { createDocsEngine, extractColors, extractProperties, resolveVariables } from '../src/docs'
import { createRpcFunctions } from '../src/rpc'

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

  it('does not count safelisted tokens once per module', async () => {
    const ctx = createContext({ presets: [presetWind3()], safelist: ['p-2', 'mb-4'] })
    const secondModule = '/root/playground/Other.vue'
    await ctx.ready
    await ctx.extract('<div class="p-2 m-4" />', MODULE_ID)
    await ctx.extract('<div class="m-4" />', secondModule)
    await ctx.flushTasks()

    const result = await analyzer(ctx.modules, ctx)
    const p2 = result.matched.find(item => item.name === 'p-2')
    expect(p2?.count).toBe(1)
    expect(p2?.modules).toEqual([MODULE_ID])
    expect(result.matched.find(item => item.name === 'mb-4')).toBeUndefined()
  })

  it('exposes declarations that tell aliases apart from utilities sharing a value', async () => {
    const ctx = createContext({ presets: [presetWind3()] })
    await ctx.ready
    await ctx.extract('<div class="z-2 mb-2 md:mb-2 m-b-2 hover:mb-2" />', MODULE_ID)
    await ctx.flushTasks()

    const result = await analyzer(ctx.modules, ctx)
    const declarationsOf = (name: string) => result.matched.find(item => item.name === name)?.declarations

    expect(declarationsOf('z-2')).toBeTruthy()
    expect(declarationsOf('z-2')).not.toBe(declarationsOf('mb-2'))
    expect(declarationsOf('md:mb-2')).toBe(declarationsOf('mb-2'))
    expect(declarationsOf('m-b-2')).toBe(declarationsOf('mb-2'))
    expect(declarationsOf('hover:mb-2')).toBe(declarationsOf('mb-2'))
  })
})

describe('inspector docs', () => {
  async function prepareDocsContext(details?: boolean) {
    const ctx = createContext({
      details,
      presets: [
        presetWind3(),
      ],
      rules: [
        [/^brand-(\d+)$/, ([, d]) => ({ 'letter-spacing': `${d}px` })],
      ],
      shortcuts: {
        'btn-primary': 'px-4 py-2 rounded bg-blue-500 text-white',
      },
    })
    await ctx.ready
    return ctx
  }

  it('searches utilities against the project config', async () => {
    const ctx = await prepareDocsContext()
    const searchDocs = createRpcFunctions(ctx).find(fn => fn.name === 'search-docs')!
    const handler = await resolveHandler(searchDocs)

    const shortcut: DocsSearchItem[] = await handler('btn-primary')
    expect(shortcut[0]).toMatchObject({ class: 'btn-primary', kind: 'shortcut' })

    const custom: DocsSearchItem[] = await handler('brand-4')
    expect(custom[0]).toMatchObject({ class: 'brand-4', kind: 'dynamic', body: 'letter-spacing: 4px;' })

    const byBody: DocsSearchItem[] = await handler('display: flex')
    expect(byBody.map(i => i.class)).toContain('flex')

    expect(await handler('  ')).toEqual([])
    expect(() => JSON.stringify(shortcut)).not.toThrow()

    // A static dump answers `null`, so the client can tell it from no results
    expect((searchDocs as any).dump.fallback).toBeNull()
  })

  it('describes the rules, presets and variants behind a utility', async () => {
    const ctx = await prepareDocsContext()
    const getDocsItem = createRpcFunctions(ctx).find(fn => fn.name === 'get-docs-item')!
    const handler = await resolveHandler(getDocsItem)

    const custom: DocsItem = await handler('brand-4')
    expect(custom.rules).toEqual([{ matcher: '/^brand-(\\d+)$/', static: false, preset: undefined }])
    expect(custom.properties).toEqual(['letter-spacing'])

    const preset: DocsItem = await handler('text-red-500')
    expect(preset.rules[0].preset).toBe('@unocss/preset-wind3')
    expect(preset.colors.length).toBeGreaterThan(0)
    expect(preset.css).toContain('.text-red-500')

    const variant: DocsItem = await handler('hover:p-2')
    expect(variant.kind).toBe('variant')
    expect(variant.variants.map(i => i.result)).toEqual(['hover:p-2', 'p-2'])

    const shortcut: DocsItem = await handler('btn-primary')
    expect(shortcut.shortcuts).toEqual([{ from: 'btn-primary', to: 'px-4 py-2 rounded bg-blue-500 text-white' }])

    // Aliases come from utilities the engine has already seen
    await handler('m-b-2')
    const margin: DocsItem = await handler('mb-2')
    expect(margin.aliases).toContain('m-b-2')
    expect(margin.sameRule.length).toBeGreaterThan(0)

    expect(await handler('not-a-utility')).toBeNull()
    expect(() => JSON.stringify(preset)).not.toThrow()
  })

  it('keeps provenance when the project disables details', async () => {
    const ctx = await prepareDocsContext(false)
    expect(ctx.uno.config.details).toBe(false)

    const item = await createDocsEngine(ctx.uno).getItem('brand-4')
    expect(item?.rules.length).toBe(1)
    expect(ctx.uno.config.details).toBe(false)
  })

  it('extracts swatch colors and properties from declarations only', () => {
    const css = [
      '.text-\\[\\#fff\\]{--un-text-opacity:1;color:rgb(255 255 255 / var(--un-text-opacity));}',
      '.c:hover{border-color:#abc;background:color-mix(in oklch, red 50%, var(--un-c, blue))}',
    ].join('\n')
    expect(extractColors(css)).toEqual(['rgb(255 255 255 / 1)', '#abc', 'color-mix(in oklch, red 50%, blue)'])
    expect(extractProperties(css)).toEqual(['color', 'border-color', 'background'])

    // Unknown variables leave nothing to paint
    expect(extractColors('.a{color:rgb(var(--unknown));}')).toEqual([])

    // Custom properties carry the colors of gradient stops and rings
    expect(extractColors('.a{--un-gradient-from:rgb(1 2 3);}')).toEqual(['rgb(1 2 3)'])
    // Fallbacks may nest parentheses and further variables
    expect(extractColors('.a{color:var(--x, rgb(0 0 0));}')).toEqual(['rgb(0 0 0)'])
    expect(resolveVariables('rgb(0 0 0 / var(--a, var(--b, calc(1 - .5))))', new Map())).toBe('rgb(0 0 0 / calc(1 - .5))')
    expect(resolveVariables('var(--a, red)', new Map([['--a', 'blue']]))).toBe('blue')
    // A cycle never resolves
    expect(resolveVariables('var(--a)', new Map([['--a', 'var(--a)']]))).toBeUndefined()
  })

  it('resolves theme variables and skips @property descriptors', async () => {
    const ctx = createContext({
      presets: [presetWind4()],
      shortcuts: { tinted: 'bg-red-500/8' },
    })
    await ctx.ready
    const docs = createDocsEngine(ctx.uno)

    const item = await docs.getItem('text-red-500')
    expect(item?.css).toContain('@property')
    expect(item?.properties).toEqual(['color'])
    expect(item?.colors.length).toBeGreaterThan(0)
    expect(item?.colors.every(color => !color.includes('var('))).toBe(true)
    // `/* oklch(...) */` hints are comments, not applied colors
    expect(item?.colors.every(color => color.startsWith('color-mix('))).toBe(true)

    for (const token of ['from-red-500', 'ring-red-500'])
      expect((await docs.getItem(token))?.colors.length, token).toBeGreaterThan(0)

    const shortcut = await docs.getItem('tinted')
    expect(shortcut?.kind).toBe('shortcut')
    expect(shortcut?.body).toContain('background-color')
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
      'search-docs',
      'get-docs-item',
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
