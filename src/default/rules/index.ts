import { NanowindRule } from '../../types'
import { directionMap } from '../../utils'
import { h } from '../../handlers'

const directionSize = (prefix: string) => ([_, direction, size]: string[]) => {
  const v = h.size.fraction(size)
  if (v)
    return Object.fromEntries(directionMap[direction].map(i => [prefix + i, v]))
}

export const padding: NanowindRule[] = [
  [/^p()-(\w+)$/, directionSize('padding')],
  [/^p([xy]?)-(\w+)$/, directionSize('padding')],
  [/^p([trbl]?)-(\w+)$/, directionSize('padding')],
]

export const margin: NanowindRule[] = [
  [/^m()-(\w+)$/, directionSize('margin')],
  [/^m([xy]?)-(\w+)$/, directionSize('margin')],
  [/^m([trbl]?)-(\w+)$/, directionSize('margin')],
]

export const defaultRules = [
  ...padding,
  ...margin,
]
