import type { Rule } from '@unocss/core'
import { directionSize } from '../utils'

export const paddings: Rule[] = [
  [/^pa?()-?(-?.+)$/, directionSize('padding'), { autocomplete: '(m|p)<directions>-<num>' }],
  [/^p-?([xy])-?(-?.+)$/, directionSize('padding')],
  [/^p-?([rltbse])-?(-?.+)$/, directionSize('padding')],
  [/^p-(block|inline)-(-?.+)$/, directionSize('padding')],
  [/^p-?([bi][se])-?(-?.+)$/, directionSize('padding')],
]

export const margins: Rule[] = [
  [/^ma?()-?(-?.+)$/, directionSize('margin')],
  [/^m-?([xy])-?(-?.+)$/, directionSize('margin')],
  [/^m-?([rltbse])-?(-?.+)$/, directionSize('margin')],
  [/^m-(block|inline)-(-?.+)$/, directionSize('margin')],
  [/^m-?([bi][se])-?(-?.+)$/, directionSize('margin')],
]
