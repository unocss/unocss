import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { parse } from 'postcss'
import { describe, expect, it } from 'vitest'
import { declarationPaths, declarations, generate } from './utils/wind4-tailwind4'

describe('wind4 / Tailwind composition contracts', () => {
  it.each([
    ['size-[13px]', { width: '13px', height: '13px' }],
    ['line-clamp-3', { 'overflow': 'hidden', 'display': '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': '3' }],
    ['truncate', { 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }],
    ['sr-only', { 'position': 'absolute', 'width': '1px', 'height': '1px', 'overflow': 'hidden', 'white-space': 'nowrap' }],
    ['not-sr-only', { 'position': 'static', 'width': 'auto', 'height': 'auto', 'overflow': 'visible', 'white-space': 'normal' }],
    ['rounded-t-[7px]', { 'border-top-left-radius': '7px', 'border-top-right-radius': '7px' }],
    ['rounded-r-[7px]', { 'border-top-right-radius': '7px', 'border-bottom-right-radius': '7px' }],
    ['rounded-b-[7px]', { 'border-bottom-left-radius': '7px', 'border-bottom-right-radius': '7px' }],
    ['rounded-l-[7px]', { 'border-top-left-radius': '7px', 'border-bottom-left-radius': '7px' }],
    ['rounded-s-[7px]', { 'border-start-start-radius': '7px', 'border-end-start-radius': '7px' }],
    ['rounded-e-[7px]', { 'border-start-end-radius': '7px', 'border-end-end-radius': '7px' }],
  ])('%s sets all required declarations', async (candidate, expected) => {
    const { wind, tailwind } = await generate(candidate)
    for (const root of [tailwind, wind])
      expect(declarations(root, candidate)).toMatchObject(expected)
  })

  it('background image URL indirection, transition shorthand, and easing theme variable', async () => {
    const { wind, tailwind } = await generate(['bg-[url(/texture.png)]', 'transition-none', 'ease-linear'])
    expect(declarations(tailwind, 'bg-[url(/texture.png)]')['background-image']).toBe('url(/texture.png)')
    expect(declarations(wind, 'bg-[url(/texture.png)]')).toMatchObject({ '--un-url': 'url(/texture.png)', 'background-image': 'var(--un-url)' })
    expect(declarations(tailwind, 'transition-none')['transition-property']).toBe('none')
    expect(declarations(wind, 'transition-none').transition).toBe('none')
    expect(declarations(tailwind, 'ease-linear')['transition-timing-function']).toBe('linear')
    expect(declarations(wind, 'ease-linear')['transition-timing-function']).toBe('var(--ease-linear)')
    expect(declarationPaths(wind, '--ease-linear', 'linear')).toEqual([':root, :host'])
  })

  it.each(['x', 'y', 'z'])('translate-%s composes through registered axis variables', async (axis) => {
    const candidate = `translate-${axis}-[13px]`
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const output = declarations(root, candidate)
      expect(output[`--${prefix}-translate-${axis}`]).toBe('13px')
      expect(output.translate).toBe(`var(--${prefix}-translate-x) var(--${prefix}-translate-y)${axis === 'z' ? ` var(--${prefix}-translate-z)` : ''}`)
      const properties: string[] = []
      root.walkAtRules('property', (rule) => {
        properties.push(rule.params)
      })
      expect(properties).toContain(`--${prefix}-translate-${axis}`)
    }
  })

  it.each(['x', 'y', 'z'])('rotate-%s does not erase the other transform components', async (axis) => {
    const candidate = `rotate-${axis}-45`
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const output = declarations(root, candidate)
      expect(output[`--${prefix}-rotate-${axis}`]).toBe(`rotate${axis.toUpperCase()}(45deg)`)
      for (const component of ['rotate-x', 'rotate-y', 'rotate-z', 'skew-x', 'skew-y'])
        expect(output.transform).toContain(`var(--${prefix}-${component}`)
    }
  })

  it.each(['x', 'y'])('skew-%s retains rotate and skew components', async (axis) => {
    const candidate = `skew-${axis}-12`
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const output = declarations(root, candidate)
      expect(output[`--${prefix}-skew-${axis}`]).toBe(`skew${axis.toUpperCase()}(12deg)`)
      for (const component of ['rotate-x', 'rotate-y', 'rotate-z', 'skew-x', 'skew-y'])
        expect(output.transform).toContain(`var(--${prefix}-${component}`)
    }
  })

  it.each(['x', 'y', 'z'])('scale-%s composes with other axes', async (axis) => {
    const candidate = `scale-${axis}-125`
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const output = declarations(root, candidate)
      expect(output[`--${prefix}-scale-${axis}`]).toBe('125%')
      expect(output.scale).toBe(`var(--${prefix}-scale-x) var(--${prefix}-scale-y)${axis === 'z' ? ` var(--${prefix}-scale-z)` : ''}`)
    }
  })

  it.each([
    ['blur-[3px]', 'blur', 'blur(3px)'],
    ['brightness-[1.25]', 'brightness', 'brightness(1.25)'],
    ['contrast-[1.25]', 'contrast', 'contrast(1.25)'],
    ['grayscale-[0.5]', 'grayscale', 'grayscale(0.5)'],
    ['hue-rotate-[30deg]', 'hue-rotate', 'hue-rotate(30deg)'],
    ['invert-[0.5]', 'invert', 'invert(0.5)'],
    ['saturate-[1.25]', 'saturate', 'saturate(1.25)'],
    ['sepia-[0.5]', 'sepia', 'sepia(0.5)'],
  ])('filter and backdrop-filter component: %s', async (candidate, component, value) => {
    for (const backdrop of ['', 'backdrop-']) {
      const token = `${backdrop}${candidate}`
      const { wind, tailwind } = await generate(token)
      for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
        const output = declarations(root, token)
        expect(output[`--${prefix}-${backdrop}${component}`]).toBe(value)
        for (const part of ['blur', 'brightness', 'contrast', 'grayscale', 'hue-rotate', 'invert', 'saturate', 'sepia'])
          expect(output[`${backdrop}filter`]).toContain(`var(--${prefix}-${backdrop}${part}`)
      }
    }
  })

  it('backdrop opacity component', async () => {
    const { wind, tailwind } = await generate('backdrop-opacity-[0.5]')
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const output = declarations(root, 'backdrop-opacity-[0.5]')
      expect(output[`--${prefix}-backdrop-opacity`]).toBe('opacity(0.5)')
      expect(output['backdrop-filter']).toContain(`var(--${prefix}-backdrop-opacity`)
    }
  })

  it.each([
    ['shadow-[1px_2px_3px_black]', 'shadow', 'box-shadow'],
    ['inset-shadow-[inset_1px_2px_3px_black]', 'inset-shadow', 'box-shadow'],
    ['text-shadow-[1px_2px_3px_black]', 'text-shadow', 'text-shadow'],
  ])('%s retains geometry and uses its component', async (candidate, component, property) => {
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const output = declarations(root, candidate)
      if (prefix === 'tw' && property === 'text-shadow') {
        expect(output[property]).toContain('1px 2px 3px')
      }
      else {
        expect(output[`--${prefix}-${component}`]).toContain('1px 2px 3px')
        expect(output[property]).toContain(`var(--${prefix}-${component}`)
      }
      if (property === 'box-shadow') {
        for (const part of ['inset-shadow', 'inset-ring-shadow', 'ring-offset-shadow', 'ring-shadow', 'shadow'])
          expect(output[property]).toContain(`var(--${prefix}-${part}`)
      }
    }
  })

  it('ring, inset-ring, and ring-offset compose with shadows', async () => {
    const { wind, tailwind } = await generate(['ring-2', 'inset-ring-2', 'ring-offset-4', 'shadow-sm'])
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      expect(declarations(root, 'ring-offset-4')[`--${prefix}-ring-offset-width`]).toBe('4px')
      expect(declarations(root, 'ring-2')[`--${prefix}-ring-shadow`]).toContain(`calc(2px + var(--${prefix}-ring-offset-width))`)
      expect(declarations(root, 'inset-ring-2')[`--${prefix}-inset-ring-shadow`]).toContain('inset 0 0 0 2px')
      for (const token of ['ring-2', 'inset-ring-2', 'shadow-sm']) {
        for (const part of ['inset-shadow', 'inset-ring-shadow', 'ring-offset-shadow', 'ring-shadow', 'shadow'])
          expect(declarations(root, token)['box-shadow']).toContain(`var(--${prefix}-${part}`)
      }
    }
  })

  it('scroll-snap type and strictness compose', async () => {
    const { wind, tailwind } = await generate(['snap-x', 'snap-mandatory'])
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      expect(declarations(root, 'snap-x')['scroll-snap-type']).toBe(`x var(--${prefix}-scroll-snap-strictness)`)
      expect(declarations(root, 'snap-mandatory')[`--${prefix}-scroll-snap-strictness`]).toBe('mandatory')
    }
  })

  it('touch-pan and touch-pinch-zoom compose', async () => {
    const { wind, tailwind } = await generate(['touch-pan-x', 'touch-pinch-zoom'])
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      expect(declarations(root, 'touch-pan-x')[`--${prefix}-pan-x`]).toBe('pan-x')
      expect(declarations(root, 'touch-pinch-zoom')[`--${prefix}-pinch-zoom`]).toBe('pinch-zoom')
      for (const part of ['pan-x', 'pan-y', 'pinch-zoom'])
        expect(declarations(root, 'touch-pan-x')['touch-action']).toContain(`var(--${prefix}-${part}`)
    }
  })

  it.each(['border-spacing', 'border-spacing-x', 'border-spacing-y'])('%s composes both axes', async (family) => {
    const candidate = `${family}-[13px]`
    const { wind, tailwind } = await generate(candidate)
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      const output = declarations(root, candidate)
      for (const axis of family === 'border-spacing' ? ['x', 'y'] : [family.endsWith('x') ? 'x' : 'y'])
        expect(output[`--${prefix}-border-spacing-${axis}`]).toBe('13px')
      expect(output['border-spacing']).toBe(`var(--${prefix}-border-spacing-x) var(--${prefix}-border-spacing-y)`)
    }
  })

  it('font numeric variants compose instead of replacing each other', async () => {
    const { wind, tailwind } = await generate(['tabular-nums', 'slashed-zero'])
    for (const [root, prefix] of [[tailwind, 'tw'], [wind, 'un']] as const) {
      expect(declarations(root, 'tabular-nums')[`--${prefix}-numeric-spacing`]).toBe('tabular-nums')
      expect(declarations(root, 'slashed-zero')[`--${prefix}-slashed-zero`]).toBe('slashed-zero')
      for (const token of ['tabular-nums', 'slashed-zero']) {
        expect(declarations(root, token)['font-variant-numeric']).toContain(`var(--${prefix}-numeric-spacing`)
        expect(declarations(root, token)['font-variant-numeric']).toContain(`var(--${prefix}-slashed-zero`)
      }
    }
  })

  it('logical scroll syntax alternatives retain the requested capability', async () => {
    const uno = await createGenerator({ presets: [presetWind4()] })
    for (const [token, property] of [
      ['scroll-mis-[13px]', 'scroll-margin-inline-start'],
      ['scroll-mie-[13px]', 'scroll-margin-inline-end'],
      ['scroll-pis-[13px]', 'scroll-padding-inline-start'],
      ['scroll-pie-[13px]', 'scroll-padding-inline-end'],
    ]) {
      expect(declarations(parse((await uno.generate([token])).css), token)[property]).toBe('13px')
    }
  })
})
