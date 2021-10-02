import { NanowindCssEntries, NanowindRule } from '../../../types'
import { directionMap } from '../../../utils'
import { h } from '../../../handlers'

const directionSize = (prefix: string) => ([_, direction, size]: string[]): NanowindCssEntries | undefined => {
  const v = h.bracket.size.fraction(size)
  if (v)
    return directionMap[direction].map(i => [prefix + i, v])
}

export const paddings: NanowindRule[] = [
  [/^p()-([^-]+)$/, directionSize('padding')],
  [/^p([xy]?)-([^-]+)$/, directionSize('padding')],
  [/^p([rltb]?)-([^-]+)$/, directionSize('padding')],
]

export const margins: NanowindRule[] = [
  [/^m()-([^-]+)$/, directionSize('margin')],
  [/^m([xy]?)-([^-]+)$/, directionSize('margin')],
  [/^m([rltb]?)-([^-]+)$/, directionSize('margin')],
]
