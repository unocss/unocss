import type { BreakpointsContext } from '@unocss/rule-utils'
import { createGenerator } from '@unocss/core'
import { resolveBreakpoints, resolveScreenMediaQuery, resolveVerticalBreakpoints, variantBreakpoints } from '@unocss/rule-utils'
import { describe, expect, it } from 'vitest'

const wind3Theme = { breakpoints: { sm: '640px', md: '768px', lg: '1024px' } }
const wind4Theme = { breakpoint: { sm: '640px', md: '768px', lg: '1024px' } }
const mixedTheme = {
  breakpoints: { sm: '640px' },
  breakpoint: { sm: '40rem' },
  verticalBreakpoints: { sm: '480px' },
  verticalBreakpoint: { sm: '30rem' },
}

describe('resolveBreakpoints', () => {
  it.each([wind3Theme, wind4Theme])('detects the horizontal key by presence', (theme) => {
    expect(resolveBreakpoints({ theme })).toEqual([
      { point: 'sm', size: '640px' },
      { point: 'md', size: '768px' },
      { point: 'lg', size: '1024px' },
    ])
  })

  it('sorts breakpoints by size', () => {
    const theme = { breakpoints: { lg: '1024px', sm: '640px', md: '768px' } }
    expect(resolveBreakpoints({ theme })?.map(entry => entry.point)).toEqual(['sm', 'md', 'lg'])
  })

  it.each([
    ['breakpoints', '640px'],
    ['breakpoint', '40rem'],
    ['verticalBreakpoints', '480px'],
    ['verticalBreakpoint', '30rem'],
  ] as const)('uses the explicit %s key', (key, size) => {
    expect(resolveBreakpoints({ theme: mixedTheme }, key)).toEqual([{ point: 'sm', size }])
  })

  it('does not use another key from user configuration', () => {
    const context = {
      theme: mixedTheme,
      generator: { userConfig: { theme: { breakpoints: { sm: '100px' } } } },
    }
    expect(resolveBreakpoints(context, 'breakpoint')).toEqual([{ point: 'sm', size: '40rem' }])
    expect(resolveBreakpoints({ theme: wind4Theme }, 'breakpoints')).toBeUndefined()
  })

  it('prefers the generator user config theme', () => {
    const context = {
      theme: wind3Theme,
      generator: { userConfig: { theme: { breakpoints: { custom: '1px' } } } },
    }
    expect(resolveBreakpoints(context)).toEqual([{ point: 'custom', size: '1px' }])
  })

  it('returns undefined when no breakpoint key is present', () => {
    expect(resolveBreakpoints({ theme: {} })).toBeUndefined()
  })

  it('caches by breakpoint map, including replacement maps', () => {
    const context = { theme: { breakpoints: { sm: '640px' } } }
    const first = resolveBreakpoints(context)
    expect(resolveBreakpoints(context)).toBe(first)
    expect(resolveBreakpoints({ theme: { breakpoint: context.theme.breakpoints } })).toBe(first)
    context.theme.breakpoints = { sm: '700px' }
    expect(resolveBreakpoints(context)).toEqual([{ point: 'sm', size: '700px' }])
  })

  it.each(['variant-first', 'screen-first'])('keeps screen and user-config results separate: %s', (order) => {
    const theme = { breakpoints: { sm: '640px', md: '768px' } }
    const context: BreakpointsContext = {
      theme,
      generator: { userConfig: { theme: { breakpoints: { sm: '600px' } } } },
    }
    const checkVariant = () => expect(resolveBreakpoints(context)).toEqual([{ point: 'sm', size: '600px' }])
    const checkScreen = () => expect(resolveScreenMediaQuery(theme, 'md')).toBe('(min-width: 768px)')
    if (order === 'variant-first') {
      checkVariant()
      checkScreen()
    }
    else {
      checkScreen()
      checkVariant()
    }
    checkScreen()
    checkVariant()
  })

  it('resolves vertical breakpoints by presence', () => {
    expect(resolveVerticalBreakpoints({ theme: { verticalBreakpoints: { sm: '480px' } } }))
      .toEqual([{ point: 'sm', size: '480px' }])
    expect(resolveVerticalBreakpoints({ theme: { verticalBreakpoint: { sm: '30rem' } } }))
      .toEqual([{ point: 'sm', size: '30rem' }])
  })
})

describe('resolveScreenMediaQuery', () => {
  it.each([wind3Theme, wind4Theme])('generates a min-width query', (theme) => {
    expect(resolveScreenMediaQuery(theme, 'md')).toBe('(min-width: 768px)')
  })

  it('prefers breakpoint when both horizontal keys exist', () => {
    expect(resolveScreenMediaQuery(mixedTheme, 'sm')).toBe('(min-width: 40rem)')
    expect(() => resolveScreenMediaQuery({ breakpoint: {}, breakpoints: mixedTheme.breakpoints }, 'sm'))
      .toThrow('breakpoint sm not found')
  })

  it('generates an lt query', () => {
    expect(resolveScreenMediaQuery(wind3Theme, 'lt-md')).toBe('(max-width: 767.9px)')
    expect(resolveScreenMediaQuery(mixedTheme, 'lt-sm')).toBe('(max-width: calc(40rem - 0.1px))')
  })

  it('generates an at query bounded by the next breakpoint', () => {
    expect(resolveScreenMediaQuery(wind3Theme, 'at-md')).toBe('(min-width: 768px) and (max-width: 1023.9px)')
    expect(resolveScreenMediaQuery(wind3Theme, 'at-lg')).toBe('(min-width: 1024px)')
  })

  it('throws for unknown breakpoints', () => {
    expect(() => resolveScreenMediaQuery(wind3Theme, 'xl')).toThrow('breakpoint xl not found')
    expect(() => resolveScreenMediaQuery(wind3Theme, 'lt-xl')).toThrow('breakpoint xl not found')
  })
})

describe('variantBreakpoints', () => {
  async function match(matcher: string, theme: object = wind3Theme, themeKey: 'breakpoint' | 'breakpoints' = 'breakpoints', parent = '') {
    const generator = await createGenerator({ theme })
    const result = await variantBreakpoints(themeKey).match(matcher, { theme, generator, rawSelector: matcher })
    if (!result)
      return undefined
    if (typeof result === 'string' || Array.isArray(result) || !result.handle)
      throw new Error('Expected one breakpoint handler')
    return {
      matcher: result.matcher,
      ...result.handle({ prefix: '', selector: '', pseudo: '', parent, entries: [] }, input => input),
    }
  }

  it('resolves the parent media query', async () => {
    expect(await match('md:font-bold')).toMatchObject({ matcher: 'font-bold', parent: '@media (min-width: 768px)', parentOrder: 3002 })
  })

  it.each(['lt-', '<', 'max-'])('supports the %s prefix with descending order', async (prefix) => {
    expect(await match(`${prefix}md:font-bold`)).toMatchObject({ parent: '@media (max-width: 767.9px)', parentOrder: 2998 })
  })

  it.each(['at-', '~'])('supports the %s prefix and an unbounded final breakpoint', async (prefix) => {
    expect(await match(`${prefix}md:font-bold`)).toMatchObject({ parent: '@media (min-width: 768px) and (max-width: 1023.9px)', parentOrder: 3002 })
    expect(await match(`${prefix}lg:font-bold`)).toMatchObject({ parent: '@media (min-width: 1024px)', parentOrder: 3003 })
  })

  it.each([['breakpoint', '40rem'], ['breakpoints', '640px']] as const)('uses %s for resolution and autocomplete', async (key, size) => {
    expect(await match('sm:font-bold', mixedTheme, key)).toMatchObject({ parent: `@media (min-width: ${size})` })
    expect(variantBreakpoints(key).autocomplete).toBe(`(at-|lt-|max-|)$${key}:`)
  })

  it('preserves existing parents', async () => {
    expect(await match('md:font-bold', wind3Theme, 'breakpoints', '@supports (display: grid)'))
      .toMatchObject({ parent: '@supports (display: grid) $$ @media (min-width: 768px)' })
  })

  it('leaves the container rule to its own variant', async () => {
    expect(await match('md:container')).toBeUndefined()
  })

  it.each(['min', 'max'])('handles arbitrary %s-width conditions', async (prefix) => {
    expect(await match(`${prefix}-[600px]:font-bold`))
      .toMatchObject({ matcher: 'font-bold', parent: `@media (${prefix}-width: 600px)` })
  })
})
