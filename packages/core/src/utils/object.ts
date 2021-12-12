import type { Shortcut, StaticShortcut, CSSEntries, CSSValues, DeepPartial, Rule, StaticRule, CSSObject } from '../types'

export function normalizeCSSEntries(obj: CSSEntries | CSSObject): CSSEntries {
  return (!Array.isArray(obj) ? Object.entries(obj) : obj).filter(i => i[1] != null)
}

export function normalizeCSSValues(obj: CSSValues): CSSEntries[] {
  if (Array.isArray(obj)) {
    // @ts-expect-error
    if (obj.find(i => !Array.isArray(i) || Array.isArray(i[0])))
      return (obj as any).map((i: any) => normalizeCSSEntries(i))
    else
      return [obj as any]
  }
  else {
    return [normalizeCSSEntries(obj)]
  }
}

export function clearIdenticalEntries(entry: CSSEntries): CSSEntries {
  return entry.filter(([k, v], idx) => {
    // remove control keys
    if (k.startsWith('$$'))
      return false
    // remove identical entries
    for (let i = idx - 1; i >= 0; i--) {
      if (entry[i][0] === k && entry[i][1] === v)
        return false
    }
    return true
  })
}

export function entriesToCss(arr?: CSSEntries) {
  if (arr == null)
    return ''
  return clearIdenticalEntries(arr)
    .map(([key, value]) => value != null ? `${key}:${value};` : undefined)
    .filter(Boolean)
    .join('')
}

export function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

export function mergeDeep<T>(original: T, patch: DeepPartial<T>): T {
  const o = original as any
  const p = patch as any

  if (Array.isArray(o) && Array.isArray(p))
    return [...o, ...p] as any

  if (Array.isArray(o))
    return [...o] as any

  const output = { ...o }
  if (isObject(o) && isObject(p)) {
    Object.keys(p).forEach((key) => {
      if (isObject(p[key])) {
        if (!(key in o))
          Object.assign(output, { [key]: p[key] })
        else
          output[key] = mergeDeep(o[key], p[key])
      }
      else {
        Object.assign(output, { [key]: p[key] })
      }
    })
  }
  return output
}

export function isStaticRule(rule: Rule): rule is StaticRule {
  return typeof rule[0] === 'string'
}

export function isStaticShortcut(sc: Shortcut): sc is StaticShortcut {
  return typeof sc[0] === 'string'
}
