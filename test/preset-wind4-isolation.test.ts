import type { Theme } from '@unocss/preset-wind4'
import type { ThemeInput, Wind4Context } from '@unocss/preset-wind4/utils'
import { createGenerator, symbols } from '@unocss/core'
import presetWind4, { rules, theme, variants } from '@unocss/preset-wind4'
import { defineProperty, detectThemeValue, h, handler, hasParseableColor, parseColor, propertyTracking, themeTracking, trackedProperties, trackedTheme, valueHandlers } from '@unocss/preset-wind4/utils'
import { describe, expect, it } from 'vitest'

describe('preset-wind4 dependency isolation', () => {
  it.each([undefined, { preflights: { reset: false as const } }])('retains cached spacing after another generator resolves (%j)', async (options) => {
    const a = await createGenerator({ presets: [presetWind4(options)] })
    const cold = await a.generate('p-4')
    expect(cold.css).toContain('padding:calc(var(--spacing) * 4);')
    expect(cold.css).toContain('--spacing: 0.25rem;')

    await createGenerator({ presets: [presetWind4(options)] })

    const warm = await a.generate('p-4')
    expect(warm.css).toContain('padding:calc(var(--spacing) * 4);')
    expect(warm.css).toContain('--spacing: 0.25rem;')
  })

  it('retains cached translation fallbacks separately from registrations', async () => {
    const a = await createGenerator({ presets: [presetWind4({ preflights: { reset: false } })] })
    const cold = await a.generate('translate-x-4')
    expect(cold.css).toContain('@property --un-translate-y')
    expect(cold.css).toContain('--un-translate-y:initial;')

    await createGenerator({ presets: [presetWind4({ preflights: { reset: false } })] })

    const warm = await a.generate('translate-x-4')
    expect(warm.css).toContain('@property --un-translate-y')
    expect(warm.css).toContain('--un-translate-y:initial;')
  })

  it('excludes another generator\'s scale fallback from cached translation', async () => {
    const a = await createGenerator({ presets: [presetWind4({ preflights: { reset: false } })] })
    await a.generate('translate-x-4')
    const b = await createGenerator({ presets: [presetWind4({ preflights: { reset: false } })] })
    expect((await b.generate('scale-110')).css).toContain('--un-scale-x:1;')

    const warm = await a.generate('translate-x-4')
    expect(warm.css).toContain('@property --un-translate-y')
    expect(warm.css).not.toContain('--un-scale-x:1;')
  })
})

it.each(['raw', 'resolved'] as const)('publishes independent metadata before all hooks on %s reuse', async (reuse) => {
  const raw = presetWind4({ preflights: { reset: false } })
  Object.defineProperty(raw.meta!, 'extra', { value: 7, enumerable: false })
  const a = await createGenerator({ presets: [raw] })
  const recordA = a.config.presets.find(p => p.name === raw.name)!
  const ownerA = recordA.meta!
  await a.generate('p-4 translate-x-4')
  let early: typeof ownerA | undefined
  let late: typeof ownerA | undefined
  const b = await createGenerator({ presets: [
    { name: 'before', enforce: 'pre', configResolved(c) {
      early = c.presets.find(p => p.name === raw.name)!.meta
      early!.themeDeps.add('captured:early')
    } },
    reuse === 'raw' ? raw : recordA,
    { name: 'after', enforce: 'post', configResolved(c) { late = c.presets.find(p => p.name === raw.name)!.meta } },
  ] })
  const ownerB = b.config.presets.find(p => p.name === raw.name)!.meta!
  expect(early).toBe(ownerB)
  expect(late).toBe(ownerB)
  expect(ownerB.themeDeps.has('captured:early')).toBe(true)
  expect(ownerA.themeDeps.has('captured:early')).toBe(false)
  early!.themeDeps.add('radius:md')
  early!.propertyDeps.set('--un-scale-x', '1')
  expect(ownerA.themeDeps.has('radius:md')).toBe(false)
  expect(ownerA.propertyDeps.has('--un-scale-x')).toBe(false)
  expect(ownerB.themeDeps.has('radius:md')).toBe(true)
  expect(ownerB.propertyDeps.has('--un-scale-x')).toBe(true)
  expect(Object.getOwnPropertyDescriptor(ownerB, 'extra')).toEqual(Object.getOwnPropertyDescriptor(raw.meta, 'extra'))
  expect(raw.meta!.themeDeps).not.toBe(ownerA.themeDeps)
})

type WindGenerator = Awaited<ReturnType<typeof createGenerator<Theme>>>
function metadata(uno: WindGenerator) {
  return uno.config.presets.find(p => p.name === '@unocss/preset-wind4')!.meta! as {
    themeDeps: Set<string>
    propertyDeps: Map<string, string>
  }
}
const options = { preflights: { reset: false as const } }
function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>(r => resolve = r)
  return { promise, resolve }
}

it('retains both owners across cache operations and independently replaces them on setConfig', async () => {
  const a = await createGenerator({ presets: [presetWind4(options)], theme: { spacing: { DEFAULT: '1rem' } } })
  const cold = await a.generate('p-4 translate-x-4')
  const ma = metadata(a)
  const themeA = ma.themeDeps
  const propertiesA = ma.propertyDeps
  const b = await createGenerator({ presets: [presetWind4(options)], theme: { radius: { md: '2rem' } } })
  const cb = await b.generate('rounded-md scale-110')
  const mb = metadata(b)
  expect((await a.generate('p-4 translate-x-4')).css).toBe(cold.css)
  expect(cold.css).toContain('--spacing: 1rem;')
  expect(cb.css).toContain('--radius-md: 2rem;')
  for (const op of [() => {}, () => a.invalidateToken('p-4'), () => a.resetTokenProcessing()]) {
    op()
    expect((await a.generate('p-4 translate-x-4')).css).toBe(cold.css)
    expect(metadata(a).themeDeps).toBe(themeA)
    expect(metadata(a).propertyDeps).toBe(propertiesA)
  }
  expect(ma.themeDeps.has('radius:md')).toBe(false)
  expect(ma.propertyDeps.has('--un-scale-x')).toBe(false)
  expect(mb.themeDeps.has('spacing:DEFAULT')).toBe(false)
  expect(mb.propertyDeps.has('--un-translate-x')).toBe(false)
  expect((await b.generate('rounded-md scale-110')).css).toBe(cb.css)
  await b.setConfig({ presets: [presetWind4(options)] })
  expect(metadata(b).themeDeps).not.toBe(mb.themeDeps)
  expect(metadata(b).propertyDeps).not.toBe(mb.propertyDeps)
  expect(metadata(b).themeDeps.size).toBe(0)
  expect(metadata(b).propertyDeps.size).toBe(0)
  expect((await a.generate('p-4 translate-x-4')).css).toBe(cold.css)
  await a.setConfig({ presets: [presetWind4(options)], theme: { spacing: { DEFAULT: '3rem' } } })
  expect(metadata(a).themeDeps).not.toBe(themeA)
  expect(metadata(a).propertyDeps).not.toBe(propertiesA)
  expect(metadata(a).propertyDeps.size).toBe(0)
  expect((await a.generate('p-4')).css).toContain('--spacing: 3rem;')
  expect(metadata(a).propertyDeps.size).toBe(0)
})

it('isolates a reused raw configuration with shared and subsequently replaced theme roots', async () => {
  const shared: Theme = { spacing: { DEFAULT: '1rem' }, radius: { md: '2rem' } }
  const config = { presets: [presetWind4(options)], extendTheme: () => shared }
  const a = await createGenerator(config)
  const b = await createGenerator(config)
  expect(a.config.theme).toBe(shared)
  expect(b.config.theme).toBe(shared)
  await a.generate('p-4 translate-x-4')
  await b.generate('rounded-md scale-110')
  expect(metadata(a).themeDeps.has('radius:md')).toBe(false)
  expect(metadata(b).themeDeps.has('spacing:DEFAULT')).toBe(false)
  const owner = metadata(a)
  a.config.theme = { spacing: { DEFAULT: '5rem' } }
  expect((await a.generate('p-4')).css).toContain('--spacing: 5rem;')
  expect(metadata(a)).toBe(owner)
  const c = await createGenerator({
    ...config,
    configResolved(config) {
      config.theme = shared
    },
  })
  expect(c.config.theme).toBe(shared)
  await c.generate('rounded-md')
  expect(metadata(c).themeDeps.has('spacing:DEFAULT')).toBe(false)
})

it('scopes asynchronous producers across another generator resolving and generating', async () => {
  const entered = deferred()
  const release = deferred()
  const a = await createGenerator({ presets: [presetWind4(options)], rules: [
    [/^hold$/, async (_, ctx) => {
      themeTracking('spacing', undefined, ctx)
      const definition = defineProperty('--custom', { initialValue: '4' }, ctx)
      entered.resolve()
      await release.promise
      propertyTracking('--tracker-only', '8', ctx)
      return [definition, { width: h.bracket('[--spacing(2)]', ctx) }]
    }],
  ] })
  const pending = a.generate('hold p-4 translate-x-4')
  await entered.promise
  const b = await createGenerator({ presets: [presetWind4(options)] })
  await b.generate('rounded-md scale-110')
  release.resolve()
  const result = await pending
  expect(result.css).toContain('--spacing: 0.25rem;')
  expect(result.css).toContain('--custom:4;')
  expect(result.css).toContain('--tracker-only:8;')
  expect(metadata(a).themeDeps.has('radius:md')).toBe(false)
  expect(metadata(a).propertyDeps.has('--un-scale-x')).toBe(false)
  expect(metadata(b).propertyDeps.has('--custom')).toBe(false)
  expect(metadata(b).propertyDeps.has('--tracker-only')).toBe(false)
})

it('preserves contextual call-time first writes even when definitions serialize in reverse order', async () => {
  const entered = deferred()
  const release = deferred()
  const uno = await createGenerator({ presets: [presetWind4(options)], rules: [
    [/^first$/, async (_, ctx) => {
      const definition = defineProperty('--order', { initialValue: 1 }, ctx)
      entered.resolve()
      await release.promise
      return definition
    }],
    [/^second$/, async (_, ctx) => {
      await entered.promise
      const definition = defineProperty('--order', { initialValue: 2 }, ctx)
      release.resolve()
      return definition
    }],
  ] })
  await uno.generate(['first', 'second'])
  expect(metadata(uno).propertyDeps.get('--order')).toBe('1')
  expect(trackedProperties.get('--order')).toBe('1')
})

it.each(['on-demand', true, false] as const)('keeps live metadata with theme mode %s', async (mode) => {
  const uno = await createGenerator({ presets: [presetWind4({ preflights: { reset: false, theme: mode, property: false } })] })
  const result = await uno.generate('p-4 translate-x-4')
  expect(metadata(uno).themeDeps.has('spacing:DEFAULT')).toBe(true)
  expect(metadata(uno).propertyDeps.get('--un-translate-y')).toBe('initial')
  expect(result.css).toContain('@property --un-translate-y')
  expect(result.css).not.toContain('--un-translate-y:initial;')
  expect(result.css.includes('--spacing: 0.25rem;')).toBe(mode !== false)
  const silent = await uno.generate('rounded-md scale-110', { preflights: false })
  expect(metadata(uno).themeDeps.has('radius:md')).toBe(true)
  expect(metadata(uno).propertyDeps.has('--un-scale-x')).toBe(true)
  expect(silent.css).not.toContain('--radius-md:')
})

it('tracks reset and safelisted recursive aliases and preserves process callbacks', async () => {
  const observed: string[] = []
  const uno = await createGenerator({
    presets: [presetWind4({ preflights: { theme: { process(entry) {
      observed.push(entry[0])
    } } } })],
    theme: { colors: { brand: 'var(--colors-red-500)' } },
    safelist: ['colors:brand'],
  })
  const result = await uno.generate('p-4')
  expect(metadata(uno).themeDeps.has('font:sans')).toBe(true)
  expect(metadata(uno).themeDeps.has('colors:brand')).toBe(true)
  expect(metadata(uno).themeDeps.has('colors:red-500')).toBe(true)
  expect(observed).toContain('--colors-brand')
  expect(result.css).toContain('--colors-red-500:')
})

it.each([
  ['p-lg', 'spacing:lg'],
  ['w-4', 'spacing:DEFAULT'],
  ['inset-4', 'spacing:DEFAULT'],
  ['border-spacing-4', 'spacing:DEFAULT'],
  ['bg-[--colors.red.500]', 'colors:red-500'],
  ['ring-[--colors.red.500]', 'colors:red-500'],
  ['blur-[--colors.red.500]', 'colors:red-500'],
  ['brightness-[--colors.red.500]', 'colors:red-500'],
  ['will-change-[--colors.red.500]', 'colors:red-500'],
  ['aria-[--colors.red.500]:block', 'colors:red-500'],
  ['data-[--colors.red.500]:block', 'colors:red-500'],
  ['supports-[--colors.red.500]:block', 'colors:red-500'],
  ['media-[--colors.red.500]:block', 'colors:red-500'],
  ['@[--colors.red.500]:block', 'colors:red-500'],
  ['children-[--colors.red.500]:block', 'colors:red-500'],
  ['placeholder-[--colors.red.500]', 'colors:red-500'],
  ['[&_[--colors.red.500]]:block', 'colors:red-500'],
])('binds the existing producer/probe %s to its owner', async (token, key) => {
  const uno = await createGenerator({ presets: [presetWind4(options)], theme: { spacing: { lg: '2rem' } } })
  await uno.generate([token])
  expect(metadata(uno).themeDeps.has(key)).toBe(true)
  const other = await createGenerator({ presets: [presetWind4(options)] })
  expect(metadata(uno).themeDeps.has(key)).toBe(true)
  expect(metadata(other).themeDeps.has(key)).toBe(false)
})

it('binds only proven hoisted/static/shortcut definitions and preserves fallbacks and controls', async () => {
  const brand = defineProperty('--brand', { initialValue: '0' })
  const zero = defineProperty('--zero', { initialValue: 0 })
  const manual = { [symbols.variants]: () => [{ layer: 'properties', selector: () => '@property --un-user' }], 'syntax': '"<number>"', 'inherits': 'false', 'initial-value': 7 }
  const uno = await createGenerator({ presets: [presetWind4(options)], rules: [['custom', [brand, zero]], ['manual', manual], [/^raw$/, () => '@property --un-raw{syntax:"*";inherits:false;initial-value:3;}']], shortcuts: { combo: 'shadow ring blur touch-pan-x ordinal outline snap-x from-red-500' } })
  const result = await uno.generate(['combo', 'custom', 'manual', 'raw'])
  const properties = metadata(uno).propertyDeps
  for (const key of ['--un-shadow', '--un-ring-offset-width', '--un-blur', '--un-pan-x', '--un-ordinal', '--un-outline-style', '--un-scroll-snap-strictness', '--un-gradient-from'])
    expect(properties.has(key), key).toBe(true)
  expect(properties.get('--brand')).toBe('0')
  expect(properties.get('--zero')).toBe('initial')
  expect(properties.has('--un-user')).toBe(false)
  expect(properties.has('--un-raw')).toBe(false)
  expect(result.css).toContain('@property --un-user')
  expect(result.css).toContain('--un-shadow:0 0 #0000;')
  expect(trackedProperties.has('--un-shadow')).toBe(false)
  expect((await uno.generate(['combo', 'custom', 'manual', 'raw'])).css).toBe(result.css)
})

it('retains legacy views without allowing their mutation to corrupt an owner', async () => {
  const preset = presetWind4(options)
  const uno = await createGenerator({ presets: [preset] })
  await uno.generate('p-4 translate-x-4')
  expect(preset.meta!.themeDeps).toBe(trackedTheme)
  expect(preset.meta!.propertyDeps).toBe(trackedProperties)
  expect(trackedTheme.has('spacing:DEFAULT')).toBe(true)
  expect(trackedProperties.get('--un-translate-y')).toBe('initial')
  trackedTheme.clear()
  trackedProperties.clear()
  themeTracking('radius', 'md')
  propertyTracking('--legacy-only', '9')
  expect(metadata(uno).themeDeps.has('spacing:DEFAULT')).toBe(true)
  expect(metadata(uno).propertyDeps.has('--un-translate-y')).toBe(true)
  expect(metadata(uno).themeDeps.has('radius:md')).toBe(false)
  expect(metadata(uno).propertyDeps.has('--legacy-only')).toBe(false)
  await createGenerator({ presets: [presetWind4(options)] })
  expect(trackedTheme.size).toBe(0)
  expect(trackedProperties.size).toBe(0)
})

it('supports old parsing calls, additive contexts and standalone exported components', async () => {
  const uno = await createGenerator({ presets: [presetWind4(options)] })
  const ctx: Wind4Context = { theme: uno.config.theme, generator: uno }
  const input: ThemeInput = ctx
  const oldParser: (str: string, theme?: Theme) => string | undefined = valueHandlers.bracket
  expect(oldParser('[--spacing(2)]', ctx.theme)).toBe('calc(var(--spacing) * 2)')
  expect(metadata(uno).themeDeps.size).toBe(0)
  expect(h).toBe(handler)
  expect(h.bracket('[--spacing(2)]', input)).toBe('calc(var(--spacing) * 2)')
  expect(metadata(uno).themeDeps.has('spacing:DEFAULT')).toBe(true)
  expect(parseColor('red-500', ctx)?.color).toBe(parseColor('red-500', ctx.theme)?.color)
  expect(hasParseableColor('[--colors.red.500]', ctx)).toBe(true)
  detectThemeValue('var(--colors-red-500)', ctx)
  expect(h.bracket('[--colors.red.500]')).toBe('var(--colors.red.500)')
  expect(valueHandlers.number('4')).toBe(4)
  const standalone = await createGenerator({ rules, variants: variants({}), theme })
  expect((await standalone.generate('p-4 hover:translate-x-4')).css).toContain('padding:calc(var(--spacing) * 4);')
})

it('associates unscoped definitions at emission while keeping legacy call-time order', async () => {
  const entered = deferred()
  const release = deferred()
  const uno = await createGenerator({ presets: [presetWind4(options)], rules: [
    [/^first$/, async () => {
      const definition = defineProperty('--unscoped-order', { initialValue: 1 })
      entered.resolve()
      await release.promise
      return definition
    }],
    [/^second$/, async () => {
      await entered.promise
      const definition = defineProperty('--unscoped-order', { initialValue: 2 })
      release.resolve()
      return definition
    }],
  ] })
  await uno.generate(['first', 'second'])
  expect(trackedProperties.get('--unscoped-order')).toBe('1')
  expect(metadata(uno).propertyDeps.get('--unscoped-order')).toBe('2')
})

it('isolates metadata when consumers rename the Wind4 preset', async () => {
  const preset = presetWind4(options)
  preset.name = 'renamed-wind4'
  const a = await createGenerator({ presets: [preset] })
  const cold = await a.generate('p-4 translate-x-4')
  const b = await createGenerator({ presets: [a.config.presets[0]] })
  await b.generate('rounded-md scale-110')
  expect((await a.generate('p-4 translate-x-4')).css).toBe(cold.css)
  expect(cold.css).toContain('--spacing: 0.25rem;')
  expect(cold.css).toContain('--un-translate-y:initial;')
})

it('keeps every public bracket parser contextual without changing pure parser signatures', async () => {
  const parsers = [valueHandlers.bracket, valueHandlers.bracketOfColor, valueHandlers.bracketOfLength, valueHandlers.bracketOfPosition, valueHandlers.bracketOfFamily, valueHandlers.bracketOfNumber]
  for (const parser of parsers) {
    const uno = await createGenerator({ presets: [presetWind4(options)] })
    const ctx = { theme: uno.config.theme, generator: uno }
    expect(parser('[--spacing(2)]', ctx)).toBe('calc(var(--spacing) * 2)')
    expect(metadata(uno).themeDeps.has('spacing:DEFAULT')).toBe(true)
  }
})

it('exposes the same owner to custom preflights with built-in output disabled', async () => {
  const seen: ReturnType<typeof metadata>[] = []
  const uno = await createGenerator({
    presets: [presetWind4({ preflights: { reset: false, theme: false, property: false } })],
    preflights: [{ getCSS({ generator }) { seen.push(metadata(generator)) } }],
  })
  await uno.generate('p-4 translate-x-4')
  await createGenerator({ presets: [presetWind4(options)] })
  await uno.generate('p-4 translate-x-4')
  expect(seen).toHaveLength(2)
  expect(seen[0]).toBe(seen[1])
  expect(seen[1].themeDeps.has('spacing:DEFAULT')).toBe(true)
  expect(seen[1].propertyDeps.get('--un-translate-y')).toBe('initial')
})
