import { NanowindCssObject } from '../types'

export function objToCss(obj?: NanowindCssObject) {
  if (!obj)
    return ''
  return Object.entries(obj)
    .map(([key, value]) => value ? `${key}:${value};` : undefined)
    .filter(Boolean)
    .join(' ')
}
