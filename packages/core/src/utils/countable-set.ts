function initCountableMap<K>(values?: Iterable<K>) {
  if (!values)
    return new Map()

  const map = new Map<K, number>()
  for (const value of values)
    map.set(value, (map.get(value) ?? 0) + 1)

  return map
}

export class CountableSet<K> extends Set<K> {
  _map: Map<K, number>

  constructor(values?: Iterable<K>) {
    super(values)
    this._map ??= initCountableMap<K>(values)
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
