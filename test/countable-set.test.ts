import { describe, expect, test } from 'vitest'
import { CountableSet } from '../packages/unocss'

describe('CountableSet', () => {
  test('constructor', () => {
    const s = new CountableSet(['bar1', 'bar2', 'bar3', 'bar2'])

    expect(s).toMatchInlineSnapshot(`
      Set {
        "bar1",
        "bar2",
        "bar3",
      }
    `)

    expect(s._map).toMatchInlineSnapshot(`
      Map {
        "bar1" => 1,
        "bar2" => 2,
        "bar3" => 1,
      }
    `)
  })

  test('add', () => {
    const s = new CountableSet()

    s.add('bar1')
    s.add('bar2')
    s.add('bar2')

    expect(s).toMatchInlineSnapshot(`
      Set {
        "bar1",
        "bar2",
      }
    `)

    expect(s._map).toMatchInlineSnapshot(`
      Map {
        "bar1" => 1,
        "bar2" => 2,
      }
    `)
  })

  test('getCount', () => {
    const s = new CountableSet(['bar1', 'bar2', 'bar2'])

    expect(s.getCount('bar1')).toBe(1)
    expect(s.getCount('bar2')).toBe(2)
  })

  test('setCount', () => {
    const s = new CountableSet()

    s.setCount('bar1', 2)
    s.setCount('bar2', 1)

    expect(s).toMatchInlineSnapshot(`
      Set {
        "bar1",
        "bar2",
      }
    `)

    expect(s._map).toMatchInlineSnapshot(`
      Map {
        "bar1" => 2,
        "bar2" => 1,
      }
    `)
  })
})
