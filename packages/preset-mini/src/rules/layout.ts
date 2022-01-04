import type { Rule } from '@unocss/core'

const overflowValues = [
  'auto',
  'hidden',
  'clip',
  'visible',
  'scroll',
]

export const overflows: Rule[] = [
  [/^(?:overflow|of)-(.+)$/, ([, v]) => overflowValues.includes(v) ? { overflow: v } : undefined],
  [/^(?:overflow|of)-([xy])-(.+)$/, ([, d, v]) => overflowValues.includes(v) ? { [`overflow-${d}`]: v } : undefined],
]
