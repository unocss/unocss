export class CountableSet<K> extends Set<K> {
  _map: Map<K, number>

  constructor(values?: Iterable<K>) {
    super(values)
    this._map ??= new Map()
  }

  add(key: K) {
    this._map ??= new Map()
    this._map.set(key, (this._map.get(key) ?? 0) + 1)
    return super.add(key)
  }

  delete(key: K) {
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
