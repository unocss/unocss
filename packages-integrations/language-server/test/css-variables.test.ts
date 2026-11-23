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

describe('getRootVariables', () => {
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
