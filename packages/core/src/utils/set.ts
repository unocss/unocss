export class CountableSet<K> {
  _map = new Map<K, number>()

  constructor(iterable?: Iterable<K>) {
    if (iterable) {
      for (const key of iterable)
        this.add(key)
    }
  }

  set(key: K, count: number) {
    this._map.set(key, count)
    return this
  }

  add(key: K) {
    this.set(key, (this._map.get(key) ?? 0) + 1)
    return this
  }

  delete(key: K) {
    return this._map.delete(key)
  }

  has(key: K) {
    return this._map.has(key)
  }

  clear() {
    this._map.clear()
  }

  get size() {
    return this._map.size
  }

  values() {
    return this._map.keys()
  }

  keys() {
    return this.values()
  }

  count(key: K) {
    return this._map.get(key) ?? 0
  }

  entries() {
    return this._map.entries()
  }

  [Symbol.iterator]() {
    return this._map.keys()
  }

  [Symbol.toStringTag]() {
    return 'CountableSet'
  }

  forEach(fn: (value: K, key: K, set: this) => void) {
    this._map.forEach((_, k) => {
      fn(k, k, this)
    })
  }
}
