export function toArray<T>(value: T | T[] = []): T[] {
  return Array.isArray(value) ? value : [value]
}

export function uniq<T>(value: T[]): T[] {
  return Array.from(new Set(value))
}

export function mergeSet<T>(target: Set<T>, append: Set<T>): Set<T> {
  append.forEach(i => target.add(i))
  return target
}
