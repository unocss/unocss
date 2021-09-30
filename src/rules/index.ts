import { NanowindRule } from '../types'
import { directionMap } from '../utils'

export const paddings: NanowindRule[] = [
  [/^p-(\d+)([a-z]*)$/, ([_, s, unit]) => ({ padding: unit ? s + unit : `${(+s) / 4}rem` })],
  [/^p([trlb])-(\d+)([a-z]*)$/, ([_, d, s, unit]) => ({ [`padding${directionMap[d] || ''}`]: unit ? s + unit : `${(+s) / 4}rem` })],
]

export const defaultRules = [
  ...paddings,
]
