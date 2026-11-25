import { cartesian, searchUsageBoundary } from '@unocss/autocomplete'
import { describe, expect, it } from 'vitest'

describe('searchUsageBoundary', () => {
  it('works', () => {
    expect(searchUsageBoundary('', 0)?.content)
      .toMatchInlineSnapshot('""')

    expect(searchUsageBoundary('<div class="p-1 p-2', 14)?.content)
      .toMatchInlineSnapshot('"p-1"')

    expect(searchUsageBoundary('<div :class="`p-1 p-2', 16, true)?.content)
      .toMatchInlineSnapshot('"p-1"')

    expect(searchUsageBoundary('<div p-1 p-2>', 10)?.content)
      .toMatchInlineSnapshot('"p-2"')

    expect(searchUsageBoundary('.a{ @apply p-2; }', 14)?.content)
      .toMatchInlineSnapshot('"p-2"')

    // No attributify
    expect(searchUsageBoundary('<div p-1 p-2>', 10, false)?.content)
      .toBe(undefined)
  })

  it('classAttributes', () => {
    const search = (html: string, classAttributes?: string[]) =>
      searchUsageBoundary(html, html.indexOf('p-1') + 1, false, classAttributes)?.content

    // not a class attribute by default
    expect(search('<Box classes="p-1 p-2')).toBe(undefined)
    expect(search('<Box classes="p-1 p-2', ['css'])).toBe(undefined)

    expect(search('<Box classes="p-1 p-2', ['classes'])).toBe('p-1')
    expect(search('<Box :classes="`p-1 p-2', [':classes'])).toBe('p-1')
    expect(search(`<Box ngClass='p-1 p-2`, ['ngClass'])).toBe('p-1')

    // names are matched exactly
    expect(search('<Box myclasses="p-1 p-2', ['classes'])).toBe(undefined)

    // `class` and `className` keep working
    expect(search('<div class="p-1 p-2', ['classes'])).toBe('p-1')
    expect(search('<div className="p-1 p-2', ['classes'])).toBe('p-1')
  })
})

it('cartesian', () => {
  const a = ['a', 'b', 'c']
  const b = ['1', '2', '3']
  // multiple
  expect(cartesian([a, b])).eql([
    ['a', '1'],
    ['a', '2'],
    ['a', '3'],
    ['b', '1'],
    ['b', '2'],
    ['b', '3'],
    ['c', '1'],
    ['c', '2'],
    ['c', '3'],
  ])
  // single
  expect(cartesian([a])).eql([
    ['a'],
    ['b'],
    ['c'],
  ])
})
