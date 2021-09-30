import { NanowindCssEntries, NanowindRule } from '../../types'
import { directionMap } from '../../utils'
import { h } from '../../handlers'

const directionSize = (prefix: string) => ([_, direction, size]: string[]): NanowindCssEntries | undefined => {
  const v = h.size.fraction(size)
  if (v)
    return directionMap[direction].map(i => [prefix + i, v])
}

export const paddings: NanowindRule[] = [
  [/^p()-(\w+)$/, directionSize('padding')],
  [/^p([xy]?)-(\w+)$/, directionSize('padding')],
  [/^p([rltb]?)-(\w+)$/, directionSize('padding')],
]

export const margins: NanowindRule[] = [
  [/^m()-(\w+)$/, directionSize('margin')],
  [/^m([xy]?)-(\w+)$/, directionSize('margin')],
  [/^m([rltb]?)-(\w+)$/, directionSize('margin')],
]
