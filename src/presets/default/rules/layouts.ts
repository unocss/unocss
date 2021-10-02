import { MiniwindRule } from '../../../types'

const overflowValues = [
  'auto',
  'hidden',
  'visible',
  'scroll',
]

export const overflows: MiniwindRule[] = [
  [/^overflow-(.+)$/, ([, v]) => overflowValues.includes(v) ? { overflow: v } : undefined],
  [/^overflow-([xy])-(.+)$/, ([, d, v]) => overflowValues.includes(v) ? { [`overflow-${d}`]: v } : undefined],
]
