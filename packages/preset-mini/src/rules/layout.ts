import type { Rule } from '@unocss/core'

const overflowValues = [
  'auto',
  'hidden',
  'clip',
  'visible',
  'scroll',
]

export const overflows: Rule[] = [
  [/^(?:overflow|of)-(.+)$/, ([, v]) => overflowValues.includes(v) ? { overflow: v } : undefined, { autocomplete: [`(overflow|of)-(${overflowValues.join('|')})`, `(overflow|of)-(x|y)-(${overflowValues.join('|')})`] }],
  [/^(?:overflow|of)-([xy])-(.+)$/, ([, d, v]) => overflowValues.includes(v) ? { [`overflow-${d}`]: v } : undefined],
]
