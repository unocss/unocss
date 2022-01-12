import type { Rule } from '@unocss/core'
import { directionSize } from '../utils'

export const paddings: Rule[] = [
  [/^pa?()-?(-?.+)$/, directionSize('padding')],
  [/^p-?([xy])-?(-?.+)$/, directionSize('padding')],
  [/^p-?([rltbse])-?(-?.+)$/, directionSize('padding')],
  [/^p-(inline|block)-(-?.+)$/, directionSize('padding')],
  [/^p-?([bi][se])-?(-?.+)$/, directionSize('padding')],
]

export const margins: Rule[] = [
  [/^ma?()-?(-?.+)$/, directionSize('margin')],
  [/^m-?([xy])-?(-?.+)$/, directionSize('margin')],
  [/^m-?([rltbse])-?(-?.+)$/, directionSize('margin')],
  [/^m-(inline|block)-(-?.+)$/, directionSize('margin')],
  [/^m-?([bi][se])-?(-?.+)$/, directionSize('margin')],
]
