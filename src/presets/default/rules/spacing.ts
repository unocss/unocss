import { MiniwindCssEntries, MiniwindRule } from '../../../types'
import { directionMap, h } from '../../../utils'

const directionSize = (prefix: string) => ([_, direction, size]: string[]): MiniwindCssEntries | undefined => {
  const v = h.bracket.size.fraction(size)
  if (v)
    return directionMap[direction].map(i => [prefix + i, v])
}

export const paddings: MiniwindRule[] = [
  [/^p()-?([^-]+)$/, directionSize('padding')],
  [/^p-?([xy])-?([^-]+)$/, directionSize('padding')],
  [/^p-?([rltb])-?([^-]+)$/, directionSize('padding')],
]

export const margins: MiniwindRule[] = [
  [/^m()-?([^-]+)$/, directionSize('margin')],
  [/^m-?([xy])-?([^-]+)$/, directionSize('margin')],
  [/^m-?([rltb])-?([^-]+)$/, directionSize('margin')],
]
