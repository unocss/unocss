import { describe, expect, it } from 'vitest'
import type { FoundClass } from './findClasses'
import { findClasses } from './findClasses'

describe(findClasses, () => {
  it('returns body, start, and end for basic class', () => {
    const code = '<span class="mb-1 pr-2 " />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'mb-1 pr-2',
        start: 13,
        end: 23,
        type: 'regular',
      },
    ]
    expect(result).toEqual(expected)
  })

  it('ignores empty classes', () => {
    const code = '<div class="" /><div class="mb-1" />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'mb-1',
        start: 28,
        end: 32,
        type: 'regular',
      },
    ]
    expect(result).toEqual(expected)
  })

  it('finds class directives', () => {
    const code = '<span class:mb-1={foo} />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'mb-1',
        start: 12,
        end: 16,
        type: 'directive',
      },
    ]
    expect(result).toEqual(expected)
  })

  it('finds class directives in quotes', () => {
    const code = '<span class:mb-1="{foo}" />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'mb-1',
        start: 12,
        end: 16,
        type: 'directive',
      },
    ]
    expect(result).toEqual(expected)
  })

  it('finds shorthand class directives', () => {
    const code = '<span class:logo />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'logo',
        start: 12,
        end: 16,
        type: 'directiveShorthand',
      },
    ]
    expect(result).toEqual(expected)
  })
})
