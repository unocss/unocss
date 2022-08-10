import type { Rule } from '@unocss/core'
import { globalKeywords } from '../utils'
import type { Theme } from '../theme'

const overflowValues = [
  'auto',
  'hidden',
  'clip',
  'visible',
  'scroll',
  ...globalKeywords,
]

export const overflows: Rule<Theme>[] = [
  [/^(?:overflow|of)-(.+)$/, ([, v]) => overflowValues.includes(v) ? { overflow: v } : undefined, { autocomplete: [`(overflow|of)-(${overflowValues.join('|')})`, `(overflow|of)-(x|y)-(${overflowValues.join('|')})`] }],
  [/^(?:overflow|of)-([xy])-(.+)$/, ([, d, v]) => overflowValues.includes(v) ? { [`overflow-${d}`]: v } : undefined],
]
