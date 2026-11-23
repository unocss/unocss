import type { UserConfig } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { getPrettiedCSS } from '../src/utils/css'
import { getRootVariables } from '../src/utils/css-variables'

async function hover(config: UserConfig, util: string, remToPxRatio = 16) {
  const uno = await createGenerator(config)
  return (await getPrettiedCSS(uno, util, remToPxRatio)).prettified
}

const wind4: UserConfig = { presets: [presetWind4()] }

describe('resolved CSS variable values in hover CSS', () => {
  it('evaluates wind4 spacing and converts rem to px', async () => {
    expect(await hover(wind4, 'p-4')).toContain('padding: calc(var(--spacing) * 4); /* 1rem = 16px */')
    expect(await hover(wind4, 'p-4', -1)).toContain('padding: calc(var(--spacing) * 4); /* 1rem */')
  })

  it('uses the configured spacing', async () => {
    const css = await hover({ presets: [presetWind4()], theme: { spacing: { DEFAULT: '1px' } } }, 'w-16')
    expect(css).toContain('width: calc(var(--spacing) * 16); /* 16px */')
  })

  it('resolves wind4 theme colors through color-mix', async () => {
    expect(await hover(wind4, 'text-red-500')).toContain('/* oklch(63.7% 0.237 25.331) */')
  })

  it('resolves variables declared by the utility itself', async () => {
    const css = await hover({ presets: [presetWind3()] }, 'bg-red-500')
    expect(css).toContain('background-color: rgb(239 68 68 / var(--un-bg-opacity)); /* rgb(239 68 68 / 1) */')
    expect(css).not.toContain('rgb(\n')
  })

  it('takes only unconditional root values', async () => {
    const css = await hover({
      preflights: [{ getCSS: () => ':root{--brand:red}.dark :root{--brand:blue}@media (min-width:1px){:root{--brand:green}}' }],
      rules: [['brand', { color: 'var(--brand)' }]],
    }, 'brand')
    expect(css).toContain('color: var(--brand); /* red */')
  })

  it('evaluates calc() only with matching units and keeps a partial color-mix', async () => {
    const config: UserConfig = {
      preflights: [{ getCSS: () => ':root{--n:2;--w:1px;--c:red}' }],
      rules: [
        ['sum', { 'z-index': 'calc(var(--n) + 1)' }],
        ['mixed', { width: 'calc(var(--w) + 1rem)' }],
        ['half', { color: 'color-mix(in srgb, var(--c), transparent)' }],
      ],
    }
    expect(await hover(config, 'sum')).toContain('/* 3 */')
    expect(await hover(config, 'mixed', -1)).toContain('/* calc(1px + 1rem) */')
    expect(await hover(config, 'half')).toContain('/* color-mix(in srgb, red, transparent) */')
  })

  it('uses a fallback and leaves unknown or cyclic variables unannotated', async () => {
    const config: UserConfig = {
      preflights: [{ getCSS: () => ':root{--a:var(--b);--b:var(--a)}' }],
      rules: [
        ['fallback', { margin: 'var(--nope, 4px)' }],
        ['unknown', { margin: 'var(--nope)' }],
        ['cycle', { margin: 'var(--a)' }],
      ],
    }
    expect(await hover(config, 'fallback', -1)).toContain('margin: var(--nope, 4px); /* 4px */')
    expect(await hover(config, 'unknown')).toContain('margin: var(--nope);\n')
    expect(await hover(config, 'cycle')).toContain('margin: var(--a);\n')
  })
})

describe('resolution edge cases', () => {
  const resolve = (preflight: string, rules: UserConfig['rules'], util: string, remToPxRatio = -1) =>
    hover({ preflights: [{ getCSS: () => preflight }], rules }, util, remToPxRatio)

  it('gives no value to a cycle, even through a fallback inside it', async () => {
    expect(await resolve(':root{--a:var(--b);--b:var(--a, red)}', [['probe', { color: 'var(--a)' }]], 'probe'))
      .toContain('color: var(--a);\n')
  })

  it('uses the fallback of the reading declaration when a variable is cyclic', async () => {
    expect(await resolve(':root{--a:var(--b);--b:var(--a)}', [['probe', { color: 'var(--a, red)' }]], 'probe'))
      .toContain('/* red */')
  })

  it('keeps an important declaration over a later normal one', async () => {
    expect(await resolve(':root{--brand:red!important}:root{--brand:blue}', [['probe', { color: 'var(--brand)' }]], 'probe'))
      .toContain('/* red */')
  })

  it('reads root rules inside @layer, with unlayered rules winning', async () => {
    const rules: UserConfig['rules'] = [['probe', { color: 'var(--x)' }]]
    expect(await resolve('@layer a{:root{--x:red}}', rules, 'probe')).toContain('/* red */')
    expect(await resolve('@layer a{:root{--x:red}}:root{--x:blue}', rules, 'probe')).toContain('/* blue */')
    expect(await resolve(':root{--x:blue}@layer a{:root{--x:red}}', rules, 'probe')).toContain('/* blue */')
    expect(await resolve('@layer a{:root{--x:red}}@layer b{:root{--x:green}}', rules, 'probe')).toContain('/* green */')
    expect(await resolve('@media (min-width:1px){@layer a{:root{--x:red}}}', rules, 'probe')).toContain('color: var(--x);\n')
  })

  it('keeps parentheses inside quoted fallbacks', async () => {
    expect(await resolve('', [['probe', { content: 'var(--missing, "a)b")' }]], 'probe'))
      .toContain('content: var(--missing, "a)b"); /* "a)b" */')
  })

  it('resolves escaped names spelled the same way', async () => {
    expect(await resolve(':root{--a\\.b:2px}', [['probe', { margin: 'var(--a\\.b)' }]], 'probe')).toContain('/* 2px */')
  })

  it('stays fast on long variable chains and skips oversized values', async () => {
    const chain = Array.from({ length: 24 }, (_, i) => `--v${i}:var(--v${i + 1}) var(--v${i + 1});`).join('')
    const start = performance.now()
    const css = await resolve(`:root{${chain}--v24:1px}`, [['probe', { margin: 'var(--v0)' }]], 'probe')
    expect(performance.now() - start).toBeLessThan(1000)
    expect(css).toContain('margin: var(--v0);\n')
  })

  it('evaluates calc() that prettier wrapped', async () => {
    const css = await hover(wind4, 'space-x-4')
    expect(css).toContain('/* 0rem = 0px */')
    expect(css).toContain('/* 1rem = 16px */')
  })

  it('reads the wind4 theme with outputToCssLayers', async () => {
    expect(await hover({ presets: [presetWind4()], outputToCssLayers: true }, 'p-4')).toContain('/* 1rem = 16px */')
  })

  it.each([
    ['throws', () => { throw new Error('boom') }],
    ['returns CSS that does not parse', () => 'a{color:red'],
  ])('keeps the hover when a preflight %s', async (_, getCSS) => {
    const css = await hover({ preflights: [{ getCSS }], rules: [['probe', { color: 'var(--brand, red)' }]] }, 'probe')
    expect(css).toContain('color: var(--brand, red);')
  })
})

describe('getRootVariables', () => {
  it('shares one preflight run between concurrent requests', async () => {
    let calls = 0
    const uno = await createGenerator({
      preflights: [{
        getCSS: async () => {
          calls++
          await Promise.resolve()
          return ':root{--brand:red}'
        },
      }],
      rules: [['probe', { color: 'var(--brand)' }]],
    })
    await Promise.all(Array.from({ length: 5 }, () => getPrettiedCSS(uno, 'probe', -1)))
    expect(calls).toBe(1)
  })

  it('does not store a preflight result under a config loaded while it ran', async () => {
    let release!: () => void
    let entered!: () => void
    const waiting = new Promise<void>(done => release = done)
    const started = new Promise<void>(done => entered = done)
    const uno = await createGenerator({
      preflights: [{
        getCSS: async () => {
          entered()
          await waiting
          return ':root{--brand:red}'
        },
      }],
      rules: [['probe', { color: 'var(--brand)' }]],
    })
    const pending = getRootVariables(uno, ['--brand'])
    await started
    await uno.setConfig({
      preflights: [{ getCSS: () => ':root{--brand:blue}' }],
      rules: [['probe', { color: 'var(--brand)' }]],
    })
    release()
    await pending
    expect((await getPrettiedCSS(uno, 'probe', -1)).prettified).toContain('/* blue */')
  })

  it('runs preflights again only for a variable it has not seen', async () => {
    let calls = 0
    const uno = await createGenerator({
      presets: [presetWind4()],
      preflights: [{ getCSS: () => { calls++ } }],
    })
    await getPrettiedCSS(uno, 'p-1', 16)
    await getPrettiedCSS(uno, 'p-2', 16)
    await getPrettiedCSS(uno, 'm-3', 16)
    expect(calls).toBe(1)

    await getPrettiedCSS(uno, 'text-blue-500', 16)
    expect(calls).toBe(2)
    expect((await getRootVariables(uno, ['--colors-blue-500'])).get('--colors-blue-500')).toContain('oklch(')
    expect(calls).toBe(2)

    await getRootVariables(uno, ['--nope'])
    await getRootVariables(uno, ['--colors-green-500'])
    await getRootVariables(uno, ['--nope'])
    expect(calls).toBe(4)
  })

  it('reads a fresh table after the config changes', async () => {
    const uno = await createGenerator({ presets: [presetWind4()] })
    await getPrettiedCSS(uno, 'p-1', 16)
    await uno.setConfig({ presets: [presetWind4()], theme: { spacing: { DEFAULT: '2px' } } })
    expect((await getPrettiedCSS(uno, 'p-1', 16)).prettified).toContain('/* 2px */')
  })
})
