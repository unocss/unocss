import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { parse } from 'postcss'
import { compile } from 'tailwindcss'
import { describe, expect, it } from 'vitest'
import { declarationPaths, declarations, generate, tailwindTheme } from './utils/wind4-tailwind4'

describe('wind4 / Tailwind values and nested utilities', () => {
  it.each([
    ['text', 'color'],
    ['bg', 'background-color'],
    ['border', 'border-color'],
    ['outline', 'outline-color'],
    ['decoration', 'text-decoration-color'],
    ['accent', 'accent-color'],
    ['caret', 'caret-color'],
    ['fill', 'fill'],
    ['stroke', 'stroke'],
  ])('%s color alpha and emitted theme value', async (utility, property) => {
    const candidate = `${utility}-red-500/50`
    const { wind, tailwind } = await generate(candidate)
    expect(declarationPaths(tailwind, property, 'color-mix(in oklab, var(--color-red-500) 50%, transparent)')[0]).toContain('@supports (color: color-mix(in lab, red, red))')
    expect(declarationPaths(tailwind, '--color-red-500', 'oklch(63.7% 0.237 25.331)')).toHaveLength(1)
    const paths = declarationPaths(wind, property, 'color-mix(in oklab, var(--colors-red-500) 50%, transparent)')
    expect(paths).toHaveLength(1)
    expect(declarationPaths(wind, '--colors-red-500', 'oklch(63.7% 0.237 25.331)')).toHaveLength(1)
  })

  it('custom theme values use each engine configuration, not identical variable names', async () => {
    const uno = await createGenerator({
      presets: [presetWind4()],
      theme: { spacing: { custom: '13px' }, colors: { brand: '#123456' }, breakpoint: { wide: '90rem' } },
    })
    const tw = await compile(`${await tailwindTheme}\n@theme { --spacing-custom: 13px; --color-brand: #123456; --breakpoint-wide: 90rem; }\n@tailwind utilities;`)
    const tokens = ['p-custom', 'bg-brand/50', 'wide:flex']
    const wind = parse((await uno.generate(tokens)).css)
    const tailwind = parse(tw.build(tokens))
    expect(declarations(wind, 'p-custom').padding).toBe('var(--spacing-custom)')
    expect(declarations(tailwind, 'p-custom').padding).toBe('var(--spacing-custom)')
    for (const root of [wind, tailwind]) {
      expect(declarationPaths(root, '--spacing-custom', '13px')).toHaveLength(1)
      expect(declarationPaths(root, 'display', 'flex')[0]).toMatch(/(?:min-width:\s*90rem|width >= 90rem)/)
    }
    expect(declarationPaths(wind, '--colors-brand', '#123456')).toHaveLength(1)
    expect(declarationPaths(tailwind, '--color-brand', '#123456')).toHaveLength(1)
    expect(declarationPaths(wind, 'background-color', 'color-mix(in oklab, var(--colors-brand) 50%, transparent)')).toHaveLength(1)
    expect(declarationPaths(tailwind, 'background-color', 'color-mix(in oklab, var(--color-brand) 50%, transparent)')).toHaveLength(1)
  })

  it('dynamic spacing, negative values, fractions and calc', async () => {
    const { wind, tailwind } = await generate(['p-4', '-m-2', 'w-1/2', 'w-[calc(100%-13px)]'])
    for (const root of [wind, tailwind]) {
      expect(declarations(root, 'p-4').padding).toBe('calc(var(--spacing) * 4)')
      expect(declarations(root, '-m-2').margin).toBe('calc(var(--spacing) * -2)')
      expect(declarationPaths(root, '--spacing', '0.25rem')).toHaveLength(1)
      expect(declarations(root, 'w-[calc(100%-13px)]').width).toMatch(/^calc\(100%\s*-\s*13px\)$/)
    }
    expect(declarations(tailwind, 'w-1/2').width).toBe('calc(1 / 2 * 100%)')
    expect(declarations(wind, 'w-1/2').width).toBe('50%')
  })

  it.each(['x', 'y'])('space-%s and reverse target only non-last children', async (axis) => {
    const tokens = [`space-${axis}-[13px]`, `space-${axis}-reverse`]
    const { wind, tailwind } = await generate(tokens)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const dimension = axis === 'x' ? 'inline' : 'block'
      const value = `calc(13px * var(--${prefix}-space-${axis}-reverse))`
      const paths = declarationPaths(root, `margin-${dimension}-start`, value)
      expect(paths).toHaveLength(1)
      expect(paths[0]).toMatch(/>\s*:not\(:last-child\)/)
      expect(declarationPaths(root, `--${prefix}-space-${axis}-reverse`, '1')[0]).toMatch(/>\s*:not\(:last-child\)/)
    }
  })

  describe.each(['x', 'y'])('divide-%s width, reverse and style target non-last children', (axis) => {
    for (const [engine, prefix] of [['tailwind', 'tw'], ['wind', 'un']] as const) {
      const gap = axis === 'x' && engine === 'wind'
      it.skipIf(gap)(`${engine}: ${gap ? 'RTL gap: Wind4 divide-x uses physical left/right borders' : 'child borders'}`, async () => {
        const output = await generate([`divide-${axis}-[3px]`, `divide-${axis}-reverse`, 'divide-dashed'])
        const root = output[engine]
        const side = axis === 'x' ? 'inline-start' : 'top'
        const paths = declarationPaths(root, `border-${side}-width`, `calc(3px * var(--${prefix}-divide-${axis}-reverse))`)
        expect(paths).toHaveLength(1)
        expect(paths[0]).toMatch(/>\s*:not\(:last-child\)/)
        expect(declarationPaths(root, `--${prefix}-divide-${axis}-reverse`, '1')[0]).toMatch(/>\s*:not\(:last-child\)/)
        expect(declarationPaths(root, 'border-style', 'dashed')[0]).toMatch(/>\s*:not\(:last-child\)/)
      })
    }
  })

  describe('divide color retains the child selector and oklab enhancement', () => {
    for (const [engine, color] of [['tailwind', 'color'], ['wind', 'colors']] as const) {
      it.skipIf(engine === 'wind')(`${engine}: Wind4 divide color drops the oklab supports branch`, async () => {
        const output = await generate('divide-red-500/50')
        const paths = declarationPaths(output[engine], 'border-color', `color-mix(in oklab, var(--${color}-red-500) 50%, transparent)`)
        expect(paths).toHaveLength(1)
        expect(paths[0]).toMatch(/>\s*:not\(:last-child\)/)
      })
    }
  })

  it.each(['thumb', 'track'])('scrollbar-%s shares both color components', async (part) => {
    const candidate = `scrollbar-${part}-(--custom)`
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const output = declarations(root, candidate)
      expect(output[`--${prefix}-scrollbar-${part}`]).toBe('var(--custom)')
      expect(output['scrollbar-color']).toContain(`var(--${prefix}-scrollbar-thumb`)
      expect(output['scrollbar-color']).toContain(`var(--${prefix}-scrollbar-track`)
    }
  })

  it.each(['from', 'via', 'to'])('gradient %s position composes with background image', async (stop) => {
    const { wind, tailwind } = await generate(['bg-linear-to-r', `${stop}-25%`])
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      expect(declarations(root, `${stop}-25%`)[`--${prefix}-gradient-${stop}-position`]).toBe('25%')
      expect(declarations(root, 'bg-linear-to-r')['background-image']).toBe(`linear-gradient(var(--${prefix}-gradient-stops))`)
      expect(declarationPaths(root, `--${prefix}-gradient-position`, 'to right in oklab')).toHaveLength(1)
    }
  })

  describe.each([
    ['bg-linear-45', 'linear', '45deg in oklab'],
    ['bg-radial', 'radial', 'in oklab'],
    ['bg-conic-45', 'conic', 'from 45deg in oklab'],
  ])('background gradient modes: %s', (candidate, mode, position) => {
    for (const [engine, prefix] of [['tailwind', 'tw'], ['wind', 'un']] as const) {
      const gap = engine === 'wind' && mode === 'linear'
      it.skipIf(gap)(`${engine}: ${gap ? 'Wind4 emits invalid from keyword for a linear gradient angle' : 'shape and color-stop composition'}`, async () => {
        const output = await generate([candidate, 'from-[#ff0000]', 'via-[#00ff00]', 'to-[#0000ff]'])
        const root = output[engine]
        expect(declarationPaths(root, `--${prefix}-gradient-position`, position)).toHaveLength(1)
        expect(declarations(root, candidate)['background-image']).toBe(`${mode}-gradient(var(--${prefix}-gradient-stops))`)
        for (const [stop, color] of [['from', '#ff0000'], ['via', '#00ff00'], ['to', '#0000ff']]) {
          const css = declarations(root, `${stop}-[${color}]`)
          expect(css[`--${prefix}-gradient-${stop}`]).toBe(engine === 'tailwind' ? color : `color-mix(in oklab, ${color} var(--un-${stop}-opacity), transparent)`)
          expect(css[`--${prefix}-gradient-stops`]).toContain(`var(--${prefix}-gradient-via-stops`)
          if (engine === 'wind')
            expect(declarationPaths(root, 'initial-value', '100%')).toContain(`@property --un-${stop}-opacity`)
        }
        expect(declarations(root, 'via-[#00ff00]')[`--${prefix}-gradient-via-stops`]).toBe(`var(--${prefix}-gradient-position), var(--${prefix}-gradient-from) var(--${prefix}-gradient-from-position), var(--${prefix}-gradient-via) var(--${prefix}-gradient-via-position), var(--${prefix}-gradient-to) var(--${prefix}-gradient-to-position)`)
      })
    }
  })

  it.each(['linear', 'radial', 'conic'])('mask-%s from/to positions feed its gradient', async (gradient) => {
    const tokens = [`mask-${gradient}-from-[13px]`, `mask-${gradient}-to-[37px]`]
    const { wind, tailwind } = await generate(tokens)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      for (const [stop, value] of [['from', '13px'], ['to', '37px']]) {
        const output = declarations(root, `mask-${gradient}-${stop}-[${value}]`)
        expect(output[`--${prefix}-mask-${gradient}-${stop}-position`]).toBe(value)
        expect(output[`--${prefix}-mask-${gradient}-stops`]).toContain(`var(--${prefix}-mask-${gradient}-${stop}-position)`)
        expect(output[`--${prefix}-mask-${gradient}`]).toBe(`${gradient}-gradient(var(--${prefix}-mask-${gradient}-stops))`)
        expect(output['mask-image']).toContain(`var(--${prefix}-mask-${gradient})`)
      }
    }
  })

  it.each([
    ['t', ['top']],
    ['r', ['right']],
    ['b', ['bottom']],
    ['l', ['left']],
    ['x', ['left', 'right']],
    ['y', ['top', 'bottom']],
  ])('mask-%s from/to positions feed each directional gradient', async (axis, directions) => {
    for (const stop of ['from', 'to']) {
      const candidate = `mask-${axis}-${stop}-[13px]`
      const { wind, tailwind } = await generate(candidate)
      for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
        const output = declarations(root, candidate)
        for (const direction of directions) {
          expect(output[`--${prefix}-mask-${direction}-${stop}-position`]).toBe('13px')
          expect(output[`--${prefix}-mask-${direction}`]).toContain(`var(--${prefix}-mask-${direction}-${stop}-position)`)
          expect(output[`--${prefix}-mask-linear`]).toContain(`var(--${prefix}-mask-${direction})`)
        }
        expect(output['mask-image']).toContain(`var(--${prefix}-mask-linear)`)
      }
    }
  })

  it('mask radial position', async () => {
    const { wind, tailwind } = await generate('mask-radial-at-bottom')
    expect(declarations(tailwind, 'mask-radial-at-bottom')['--tw-mask-radial-position']).toBe('bottom')
    expect(declarations(wind, 'mask-radial-at-bottom')['--un-mask-radial-position']).toBe('bottom')
  })

  it('animation references emitted keyframes', async () => {
    const { wind, tailwind } = await generate('animate-spin')
    expect(declarations(wind, 'animate-spin').animation).toBe('spin 1s linear infinite')
    expect(declarations(tailwind, 'animate-spin').animation).toBe('var(--animate-spin)')
    expect(declarationPaths(tailwind, '--animate-spin', 'spin 1s linear infinite')).toHaveLength(1)
    for (const root of [wind, tailwind])
      expect(declarationPaths(root, 'transform', 'rotate(360deg)')[0]).toContain('@keyframes spin')
  })
})
