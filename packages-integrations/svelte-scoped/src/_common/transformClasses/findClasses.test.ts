import type { FoundClass } from './findClasses'
import { describe, expect, it } from 'vitest'
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

  it('finds clsx like classes (singleton array)', () => {
    const code = '<span class={["abc"]} />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'abc',
        start: 15,
        end: 18,
        type: 'regular',
      },
    ]
    expect(result).toEqual(expected)
  })

  it('finds clsx like classes (simple array)', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const code = '<span class={["abc def", `ghi`, `button-${dynamic}`]} />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'abc def',
        start: 15,
        end: 22,
        type: 'regular',
      },
      {
        body: 'ghi',
        start: 26,
        end: 29,
        type: 'regular',
      },
    ]
    expect(result).toEqual(expected)
  })

  it('finds clsx like classes (conditional array)', () => {
    const code = '<span class={["abc def", true && `ghi`, false ? \'jkl\' : "mno"]} />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'abc def',
        start: 15,
        end: 22,
        type: 'regular',
      },
      {
        body: 'ghi',
        start: 34,
        end: 37,
        type: 'regular',
      },
      {
        body: 'jkl',
        start: 49,
        end: 52,
        type: 'regular',
      },
      {
        body: 'mno',
        start: 57,
        end: 60,
        type: 'regular',
      },
    ]
    expect(result).toEqual(expected)
  })

  it('finds clsx like classes (object)', () => {
    const code = '<span class={{ "abc def": true, "ghi": !bool, show }} />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'abc def',
        start: 15,
        end: 24,
        type: 'clsxObject',
      },
      {
        body: 'ghi',
        start: 32,
        end: 37,
        type: 'clsxObject',
      },
      {
        body: 'show',
        start: 46,
        end: 50,
        type: 'clsxObjectShorthand',
      },
    ]
    expect(result).toEqual(expected)
  })

  it('finds clsx like classes (complex array)', () => {
    const code = '<span class={[{ "abc def": true, "ghi": !bool, show }, "jkl", ["mno"], { pqr: 0 }]} />'
    const result = findClasses(code)
    const expected: FoundClass[] = [
      {
        body: 'abc def',
        start: 16,
        end: 25,
        type: 'clsxObject',
      },
      {
        body: 'ghi',
        start: 33,
        end: 38,
        type: 'clsxObject',
      },
      {
        body: 'show',
        start: 47,
        end: 51,
        type: 'clsxObjectShorthand',
      },
      {
        body: 'jkl',
        start: 56,
        end: 59,
        type: 'regular',
      },
      {
        body: 'mno',
        start: 64,
        end: 67,
        type: 'regular',
      },
      {
        body: 'pqr',
        start: 73,
        end: 76,
        type: 'clsxObject',
      },
    ]
    expect(result).toEqual(expected)
  })
})
