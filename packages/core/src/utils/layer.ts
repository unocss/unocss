import { Rule } from '../types'

export function withLayer<T>(layer: string, rules: Rule<T>[]) {
  rules.forEach((r) => {
    if (!r[2])
      r[2] = { layer }
    else
      r[2].layer = layer
  })
  return rules
}
