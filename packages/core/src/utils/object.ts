import type { CSSEntries, CSSEntriesInput, CSSObjectInput, CSSValue, CSSValueInput, DeepPartial, Rule, Shortcut, StaticRule, StaticShortcut } from '../types'
import { isString } from './basic'

export function normalizeCSSEntries(obj: string | CSSEntriesInput | CSSObjectInput): string | CSSEntries {
  if (isString(obj))
    return obj
  return (!Array.isArray(obj) ? Object.entries(obj) : obj).filter(i => i[1] != null) as CSSEntries
}

export function normalizeCSSValues(obj: CSSValueInput | string | (CSSValueInput | string)[]): (string | CSSEntries)[] {
  if (Array.isArray(obj)) {
    // eslint-disable-next-line ts/prefer-ts-expect-error
    // @ts-ignore type cast
    if (obj.find(i => !Array.isArray(i) || Array.isArray(i[0])))
      return (obj as (string | CSSValue)[]).map(i => normalizeCSSEntries(i))
    else
      return [obj as CSSEntries]
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

/**
 * Deep merge two objects
 */
export function mergeDeep<T>(original: T, patch: DeepPartial<T>, mergeArray = false): T {
  const o = original as any
  const p = patch as any

  if (Array.isArray(p)) {
    if (mergeArray && Array.isArray(p))
      return [...o, ...p] as any
    else
      return [...p] as any
  }

  const output = { ...o }
  if (isObject(o) && isObject(p)) {
    Object.keys(p).forEach((key) => {
      if (((isObject(o[key]) && isObject(p[key])) || (Array.isArray(o[key]) && Array.isArray(p[key]))))
        output[key] = mergeDeep(o[key], p[key], mergeArray)
      else
        Object.assign(output, { [key]: p[key] })
    })
  }
  return output
}

export function clone<T>(val: T): T {
  let k: any, out: any, tmp: any

  if (Array.isArray(val)) {
    out = Array(k = val.length)
    // eslint-disable-next-line no-cond-assign
    while (k--) out[k] = ((tmp = val[k]) && typeof tmp === 'object') ? clone(tmp) : tmp
    return out as any
  }

  if (Object.prototype.toString.call(val) === '[object Object]') {
    out = {} // null
    for (k in val) {
      if (k === '__proto__') {
        Object.defineProperty(out, k, {
          value: clone((val as any)[k]),
          configurable: true,
          enumerable: true,
          writable: true,
        })
      }
      else {
        // eslint-disable-next-line no-cond-assign
        out[k] = ((tmp = (val as any)[k]) && typeof tmp === 'object') ? clone(tmp) : tmp
      }
    }
    return out
  }

  return val
}

export function isStaticRule(rule: Rule<any>): rule is StaticRule {
  return isString(rule[0])
}

export function isStaticShortcut(sc: Shortcut<any>): sc is StaticShortcut {
  return isString(sc[0])
}
