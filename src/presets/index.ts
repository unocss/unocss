import { MiniwindRule } from '../types'
import { directionMap, e } from '../utils'

export const defaultRules: MiniwindRule[] = [
  [/^p-(\d+)([a-z]*)$/, ([f, s, unit]) => `.${e(f)} { padding: ${unit ? s + unit : `${(+s) / 4}rem`}; }`],
  [/^p([trlb])-(\d+)([a-z]*)$/, ([f, d, s, unit]) => `.${e(f)} { padding${directionMap[d] || ''}: ${unit ? s + unit : `${(+s) / 4}rem`}; }`],
]
