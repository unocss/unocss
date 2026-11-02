import { describe, expect, it } from 'vitest'
import { LRUCache } from '../src/cache'

function createReference(max: number) {
  const map = new Map<string, string[]>()
  return {
    get size() {
      return map.size
    },
    has: (key: string) => map.has(key),
    get(key: string) {
      const value = map.get(key)
      if (value !== undefined) {
        map.delete(key)
        map.set(key, value)
      }
      return value
    },
    set(key: string, value: string[]) {
      map.delete(key)
      map.set(key, value)
      if (map.size > max)
        map.delete(map.keys().next().value!)
    },
    clear: () => map.clear(),
  }
}

// Deterministic PRNG, so failures are reproducible.
function createRandom(seed: number) {
  return () => {
    seed |= 0
    seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

describe('lru cache', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUCache<string[]>(2)

    expect(cache.size).toBe(0)
    expect(cache.has('a')).toBe(false)
    expect(cache.get('a')).toBeUndefined()

    cache.set('a', ['a'])
    expect(cache.size).toBe(1)
    expect(cache.has('a')).toBe(true)
    expect(cache.get('a')).toEqual(['a'])
  })

  it('evicts the least recently used entry', () => {
    const cache = new LRUCache<string[]>(2)
    cache.set('a', ['a'])
    cache.set('b', ['b'])
    cache.set('c', ['c'])

    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
    expect(cache.size).toBe(2)
  })

  it('promotes entries on get', () => {
    const cache = new LRUCache<string[]>(2)
    cache.set('a', ['a'])
    cache.set('b', ['b'])

    cache.get('a')
    cache.set('c', ['c'])

    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
    expect(cache.has('c')).toBe(true)
  })

  it('updates existing entries without growing', () => {
    const cache = new LRUCache<string[]>(2)
    cache.set('a', ['a'])
    cache.set('b', ['b'])
    cache.set('a', ['a2'])

    expect(cache.size).toBe(2)
    expect(cache.get('a')).toEqual(['a2'])

    // `a` was just updated, so `b` is now the least recently used entry
    cache.set('c', ['c'])
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('caches empty arrays', () => {
    const cache = new LRUCache<string[]>(2)
    cache.set('a', [])

    expect(cache.has('a')).toBe(true)
    expect(cache.get('a')).toEqual([])
  })

  it('clears all entries', () => {
    const cache = new LRUCache<string[]>(2)
    cache.set('a', ['a'])
    cache.set('b', ['b'])
    cache.clear()

    expect(cache.size).toBe(0)
    expect(cache.has('a')).toBe(false)
    expect(cache.get('a')).toBeUndefined()

    cache.set('c', ['c'])
    expect(cache.size).toBe(1)
    expect(cache.get('c')).toEqual(['c'])
  })

  it('handles a max size of 1', () => {
    const cache = new LRUCache<string[]>(1)
    cache.set('a', ['a'])
    cache.set('b', ['b'])

    expect(cache.size).toBe(1)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
  })

  it('matches a reference LRU implementation', () => {
    for (const max of [1, 2, 3, 10, 100, 500]) {
      for (let seed = 1; seed <= 5; seed++) {
        const random = createRandom(seed * 7919 + max)
        const cache = new LRUCache<string[]>(max)
        const reference = createReference(max)
        const keys = Array.from({ length: Math.max(max * 2, 20) }, (_, i) => `k${i}`)

        for (let step = 0; step < 2000; step++) {
          const key = keys[Math.floor(random() * keys.length)]
          const action = random()

          if (action < 0.45) {
            expect(cache.get(key)).toEqual(reference.get(key))
          }
          else if (action < 0.6) {
            expect(cache.has(key)).toBe(reference.has(key))
          }
          else {
            const value = [`v${step}`]
            cache.set(key, value)
            reference.set(key, value)
          }

          expect(cache.size).toBe(reference.size)
        }

        for (const key of keys) {
          expect(cache.has(key)).toBe(reference.has(key))
          expect(cache.get(key)).toEqual(reference.get(key))
        }
      }
    }
  })
})
