export function toArray<T, P = T extends readonly any[] ? T : T[]>(value: T): P {
  return (Array.isArray(value) ? value : [value]) as P
}

export function uniq<T>(value: T[]): T[] {
  return Array.from(new Set(value))
}

export function uniqueBy<T>(array: readonly T[], equalFn: (a: T, b: T) => boolean): T[] {
  return array.reduce((acc: T[], cur: T) => {
    const index = acc.findIndex((item: T) => equalFn(cur, item))
    if (index === -1)
      acc.push(cur)
    return acc
  }, [])
}

export function isString(s: any): s is string {
  return typeof s === 'string'
}
