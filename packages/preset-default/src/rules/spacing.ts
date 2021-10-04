import { CSSEntries, Rule, directionMap, handler as h } from '@hummin/core'

const directionSize = (prefix: string) => ([_, direction, size]: string[]): CSSEntries | undefined => {
  const v = h.bracket.size.fraction(size)
  if (v)
    return directionMap[direction].map(i => [prefix + i, v])
}

export const paddings: Rule[] = [
  [/^p()-?([^-]+)$/, directionSize('padding')],
  [/^p-?([xy])-?([^-]+)$/, directionSize('padding')],
  [/^p-?([rltb])-?([^-]+)$/, directionSize('padding')],
]

export const margins: Rule[] = [
  [/^m()-?([^-]+)$/, directionSize('margin')],
  [/^m-?([xy])-?([^-]+)$/, directionSize('margin')],
  [/^m-?([rltb])-?([^-]+)$/, directionSize('margin')],
]
