import { Rule } from '@unocss/core'

const overflowValues = [
  'auto',
  'hidden',
  'visible',
  'scroll',
]

export const overflows: Rule[] = [
  [/^overflow-(.+)$/, ([, v]) => overflowValues.includes(v) ? { overflow: v } : undefined],
  [/^overflow-([xy])-(.+)$/, ([, d, v]) => overflowValues.includes(v) ? { [`overflow-${d}`]: v } : undefined],
]
