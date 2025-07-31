import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { directionSize } from '../utils'

const directions: Record<string, string[]> = {
  '': [''],
  'x': ['column-'],
  'y': ['row-'],
  'col': ['column-'],
  'row': ['row-'],
}

export const gaps: Rule<Theme>[] = [
  [/^(?:flex-|grid-)?gap-?()(.+)$/, directionSize('gap', directions, (p, i) => `${i}${p}`), { autocomplete: ['gap-$spacing', 'gap-<num>'] }],
  [/^(?:flex-|grid-)?gap-([xy])-?(.+)$/, directionSize('gap', directions, (p, i) => `${i}${p}`), { autocomplete: ['gap-(x|y)-$spacing', 'gap-(x|y)-<num>'] }],
  [/^(?:flex-|grid-)?gap-(col|row)-?(.+)$/, directionSize('gap', directions, (p, i) => `${i}${p}`), { autocomplete: ['gap-(col|row)-$spacing', 'gap-(col|row)-<num>'] }],
]
