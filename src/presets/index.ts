import { MiniwindRule } from '../types'
import { directionMap, e } from '../utils'

export const defaultRules: MiniwindRule[] = [
  [/^p([trlb]?)-(\d+)$/, (f, d, s) => `.${e(f)} { padding${directionMap[d] || ''}: ${(+s) / 4}rem; }`],
]
