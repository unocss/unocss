import type { Rule } from '@unocss/core'
import { directionSize } from '../utils'

export const paddings: Rule[] = [
  [/^pa?()-?(-?.+)$/, directionSize('padding')],
  [/^p-?([xy])-?(-?.+)$/, directionSize('padding')],
  [/^p-?([rltbse])-?(-?.+)$/, directionSize('padding')],
]

export const margins: Rule[] = [
  [/^ma?()-?(-?.+)$/, directionSize('margin')],
  [/^m-?([xy])-?(-?.+)$/, directionSize('margin')],
  [/^m-?([rltbse])-?(-?.+)$/, directionSize('margin')],
]
