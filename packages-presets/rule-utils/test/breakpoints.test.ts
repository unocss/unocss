import type { VariantContext } from '@unocss/core'
import { resolveBreakpoints, resolveScreenMediaQuery, variantBreakpoints } from '@unocss/rule-utils'
import { describe, expect, it } from 'vitest'

function createContext(theme: Record<string, any>): VariantContext {
  return {
    theme,
    generator: {
      config: { separators: [':'] },
      userConfig: {},
    },
  } as any
}

const wind3Theme = {
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
}

const wind4Theme = {
  breakpoint: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
}

describe('resolveBreakpoints', () => {
  it('resolves `breakpoints` (Wind3) and `breakpoint` (Wind4) keys by presence', () => {
    expect(resolveBreakpoints(createContext(wind3Theme))).toEqual([
      { point: 'sm', size: '640px' },
      { point: 'md', size: '768px' },
      { point: 'lg', size: '1024px' },
    ])
    expect(resolveBreakpoints(createContext(wind4Theme))).toEqual([
      { point: 'sm', size: '640px' },
      { point: 'md', size: '768px' },
      { point: 'lg', size: '1024px' },
    ])
  })

  it('sorts breakpoints by size', () => {
    const theme = { breakpoints: { lg: '1024px', sm: '640px', md: '768px' } }
    expect(resolveBreakpoints(createContext(theme))?.map(i => i.point)).toEqual(['sm', 'md', 'lg'])
  })

  it('resolves vertical breakpoints from either key', () => {
    expect(resolveBreakpoints(createContext({ verticalBreakpoints: { sm: '640px' } }), 'verticalBreakpoints'))
      .toEqual([{ point: 'sm', size: '640px' }])
    expect(resolveBreakpoints(createContext({ verticalBreakpoint: { sm: '640px' } }), 'verticalBreakpoint'))
      .toEqual([{ point: 'sm', size: '640px' }])
  })

  it('prefers the generator user config theme', () => {
    const context = createContext({ breakpoints: { md: '768px' } })
    context.generator!.userConfig!.theme = { breakpoints: { custom: '1px' } }
    expect(resolveBreakpoints(context)).toEqual([{ point: 'custom', size: '1px' }])
  })

  it('returns undefined when no breakpoint key is present', () => {
    expect(resolveBreakpoints(createContext({}))).toBeUndefined()
  })

  it('caches the resolved breakpoints per theme and key', () => {
    const context = createContext(wind3Theme)
    expect(resolveBreakpoints(context)).toBe(resolveBreakpoints(context))
    expect(resolveBreakpoints(context, 'verticalBreakpoints'))
      .not
      .toBe(resolveBreakpoints(context))
  })
})

describe('resolveScreenMediaQuery', () => {
  it('generates a min-width query', () => {
    expect(resolveScreenMediaQuery(wind3Theme, 'md')).toBe('(min-width: 768px)')
    expect(resolveScreenMediaQuery(wind4Theme, 'md')).toBe('(min-width: 768px)')
  })

  it('generates an lt query', () => {
    expect(resolveScreenMediaQuery(wind3Theme, 'lt-md')).toBe('(max-width: 767.9px)')
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
  const variant = variantBreakpoints()

  function match(matcher: string, theme: Record<string, any> = wind3Theme) {
    return variant.match!(matcher, createContext(theme)) as any
  }

  function runParent(handler: any) {
    let parent = ''
    let parentOrder: number | undefined
    handler.handle({ parent: '', entries: [] }, (input: any) => {
      parent = input.parent
      parentOrder = input.parentOrder
      return input
    })
    return { parent, parentOrder }
  }

  it('resolves the parent media query', () => {
    const handler = match('md:font-bold')!
    expect(handler.matcher).toBe('font-bold')
    expect(runParent(handler).parent).toBe('@media (min-width: 768px)')
  })

  it('supports lt and at prefixes with ordering', () => {
    const lt = match('lt-md:font-bold')!
    expect(lt.parentOrder).toBeUndefined()
    expect(runParent(lt)).toEqual({
      parent: '@media (max-width: 767.9px)',
      parentOrder: 2998,
    })
    const at = match('at-md:font-bold')!
    expect(at.parentOrder).toBeUndefined()
    expect(runParent(at)).toEqual({
      parent: '@media (min-width: 768px) and (max-width: 1023.9px)',
      parentOrder: 3002,
    })
  })

  it('matches Wind4 theme breakpoints', () => {
    expect(match('sm:font-bold', wind4Theme)!.matcher).toBe('font-bold')
  })

  it('leaves the container rule to its own variant', () => {
    expect(match('md:container')).toBeUndefined()
  })

  it('handles arbitrary (max|min)-width pseudo conditions', () => {
    const handler = match('max-[600px]:font-bold')!
    expect(handler.matcher).toBe('font-bold')
    expect(runParent(handler).parent).toBe('@media (max-width: 600px)')
  })
})
