import { MiniwindCssEntries, MiniwindRule, MiniwindStaticRule } from '../types'

export function entriesToCss(arr?: MiniwindCssEntries) {
  if (!arr)
    return ''
  return arr
    .map(([key, value]) => value != null ? `${key}:${value};` : undefined)
    .filter(Boolean)
    .join('')
}

export function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
}

export function mergeDeep<T>(original: T, patch: DeepPartial<T>): T {
  const o = original as any
  const p = patch as any

  if (Array.isArray(o) && Array.isArray(p))
    return [...o, ...p] as any

  if (Array.isArray(o))
    return [...o] as any

  const output = { ...o }
  if (isObject(o) && isObject(o)) {
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

export function isStaticRule(rule: MiniwindRule): rule is MiniwindStaticRule {
  return typeof rule[0] === 'string'
}
