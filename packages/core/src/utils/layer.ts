import type { Rule } from '../types'

export function withLayer<T>(layer: string, rules: Rule<T>[]) {
  rules.forEach((r) => {
    const meta = typeof r[2] === 'function' ? r[3] : r[2]
    if (!meta)
      r[r[2] ? 3 : 2] = { layer }
    else meta.layer = layer
  })
  return rules
}
