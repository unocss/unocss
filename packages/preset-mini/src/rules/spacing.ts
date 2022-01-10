import type { Rule } from '@unocss/core'
import { directionSize } from '../utils'

export const paddings: Rule[] = [
  [/^pa?()-?(-?.+)$/, directionSize('padding')],
  [/^p-?([xyik])-?(-?.+)$/, directionSize('padding')],
  [/^p-?([rltbsepq])-?(-?.+)$/, directionSize('padding')],
]

export const margins: Rule[] = [
  [/^ma?()-?(-?.+)$/, directionSize('margin')],
  [/^m-?([xyik])-?(-?.+)$/, directionSize('margin')],
  [/^m-?([rltbsepq])-?(-?.+)$/, directionSize('margin')],
]
