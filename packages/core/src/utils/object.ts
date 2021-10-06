import { Shortcut, StaticShortcut } from '..'
import { CSSEntries, DeepPartial, Rule, StaticRule } from '../types'

export function entriesToCss(arr?: CSSEntries) {
  if (arr == null)
    return ''
  return arr
    .map(([key, value]) => value != null ? `${key}:${value};` : undefined)
    .filter(Boolean)
    .join('')
}

export function isObject(item: any) {
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
