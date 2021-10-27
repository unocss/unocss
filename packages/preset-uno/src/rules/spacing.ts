import { CSSEntries, Rule } from '@unocss/core'
import { directionMap, handler as h } from '../utils'

const directionSize = (prefix: string) => ([_, direction, size]: string[]): CSSEntries | undefined => {
  const v = h.bracket.size.fraction(size)
  if (v)
    return directionMap[direction].map(i => [prefix + i, v])
}

export const paddings: Rule[] = [
  [/^pa?()-?(-?[^-]+)$/, directionSize('padding')],
  [/^p-?([xy])-?(-?[^-]+)$/, directionSize('padding')],
  [/^p-?([rltbse])-?(-?[^-]+)$/, directionSize('padding')],
]

export const margins: Rule[] = [
  [/^ma?()-?(-?[^-]+)$/, directionSize('margin')],
  [/^m-?([xy])-?(-?[^-]+)$/, directionSize('margin')],
  [/^m-?([rltbse])-?(-?[^-]+)$/, directionSize('margin')],
]
