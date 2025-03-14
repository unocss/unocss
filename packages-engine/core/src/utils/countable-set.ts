export class CountableSet<K> extends Set<K> {
  _map: Map<K, number> = new Map()

  constructor(values?: Iterable<K>) {
    super()
    if (values) {
      for (const key of values) {
        this.add(key)
      }
    }
  }

  add(key: K) {
    this._map.set(key, (this._map.get(key) ?? 0) + 1)
    return super.add(key)
  }

  delete(key: K) {
    if (!this._map.has(key)) {
      return false
    }
    this._map.delete(key)
    return super.delete(key)
  }

  clear() {
    this._map.clear()
    super.clear()
  }

  getCount(key: K) {
    return this._map.get(key) ?? 0
  }

  setCount(key: K, count: number) {
    this._map.set(key, count)
    return super.add(key)
  }
}

export function isCountableSet<T = string>(value: any): value is CountableSet<T> {
  return value instanceof CountableSet
}
