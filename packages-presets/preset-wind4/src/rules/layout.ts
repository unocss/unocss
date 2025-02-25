import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { globalKeywords } from '../utils'

const overflowValues = [
  'auto',
  'hidden',
  'clip',
  'visible',
  'scroll',
  'overlay',
  ...globalKeywords,
]

export const overflows: Rule<Theme>[] = [
  [/^(?:overflow|of)-(.+)$/, ([, v]) => overflowValues.includes(v) ? { overflow: v } : undefined, { autocomplete: [`(overflow|of)-(${overflowValues.join('|')})`, `(overflow|of)-(x|y)-(${overflowValues.join('|')})`] }],
  [/^(?:overflow|of)-([xy])-(.+)$/, ([, d, v]) => overflowValues.includes(v) ? { [`overflow-${d}`]: v } : undefined],
]
