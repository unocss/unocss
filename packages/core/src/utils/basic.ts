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

export function cacheFunction<
  T extends(str: string) => R,
  R extends string | {
    readonly [key: string]: string | number
  }
>(fn: T): T {
  const cache: Record<string, R> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as any
}
