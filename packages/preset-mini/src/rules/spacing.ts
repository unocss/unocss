import type { Rule } from '@unocss/core'
import { directionSize } from '../utils'

export const paddings: Rule[] = [
  [/^pa?()-?(-?.+)$/, directionSize('padding')],
  [/^p-?([xyno])-?(-?.+)$/, directionSize('padding')],
  [/^p-?([rltbsekd])-?(-?.+)$/, directionSize('padding')],
]

export const margins: Rule[] = [
  [/^ma?()-?(-?.+)$/, directionSize('margin')],
  [/^m-?([xyno])-?(-?.+)$/, directionSize('margin')],
  [/^m-?([rltbsekd])-?(-?.+)$/, directionSize('margin')],
]
