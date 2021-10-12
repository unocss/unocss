export class TwoKeyMap<K1, K2, V> {
  _map = new Map<K1, Map<K2, V>>()

  get(key1: K1, key2: K2): V | undefined {
    const m2 = this._map.get(key1)
    if (m2)
      return m2.get(key2)
  }

  getFallback(key1: K1, key2: K2, fallback: V): V {
    let m2 = this._map.get(key1)
    if (!m2) {
      m2 = new Map<K2, V>()
      this._map.set(key1, m2)
    }
    if (!m2.has(key2))
      m2.set(key2, fallback)
    return m2.get(key2)!
  }

  set(key1: K1, key2: K2, value: V) {
    let m2 = this._map.get(key1)
    if (!m2) {
      m2 = new Map()
      this._map.set(key1, m2)
    }
    m2.set(key2, value)
    return this
  }

  has(key1: K1, key2: K2) {
    return this._map.get(key1)?.has(key2)
  }

  delete(key1: K1, key2: K2) {
    return this._map.get(key1)?.delete(key2) || false
  }

  deleteTop(key1: K1) {
    return this._map.delete(key1)
  }

  map<T>(fn: (v: V, k1: K1, k2: K2) => T): T[] {
    return Array.from(this._map.entries())
      .flatMap(([k1, m2]) =>
        Array.from(m2.entries())
          .map(([k2, v]) => {
            return fn(v, k1, k2)
          }),
      )
  }
}

export class BetterMap<K, V> extends Map<K, V> {
  map<R>(mapFn: (value: V, key: K) => R): R[] {
    const result: R[] = []
    this.forEach((v, k) => {
      result.push(mapFn(v, k))
    })
    return result
  }
}
