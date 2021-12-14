import type { Rule } from '@unocss/core'
import { varEmpty } from '@unocss/preset-mini/rules'
import { CONTROL_BYPASS_PSEUDO_CLASS } from '@unocss/preset-mini/variants'

const touchActionBase = {
  '--un-pan-x': varEmpty,
  '--un-pan-y': varEmpty,
  '--un-pinch-zoom': varEmpty,
  '--un-touch-action': 'var(--un-pan-x) var(--un-pan-y) var(--un-pinch-zoom)',
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}

export const touchActions: Rule[] = [
  [/^touch-pan-(x|left|right)$/, ([, d]) => [
    touchActionBase,
    {
      '--un-pan-x': `pan-${d}`,
      'touch-action': 'var(--un-touch-action)',
    },
  ]],
  [/^touch-pan-(y|up|down)$/, ([, d]) => [
    touchActionBase,
    {
      '--un-pan-y': `pan-${d}`,
      'touch-action': 'var(--un-touch-action)',
    },
  ]],
  [/^touch-pinch-zoom$/, () => [
    touchActionBase,
    {
      '--un-pinch-zoom': 'pinch-zoom',
      'touch-action': 'var(--un-touch-action)',
    },
  ]],
  ['touch-auto', { 'touch-action': 'auto' }],
  ['touch-manipulation', { 'touch-action': 'manipulation' }],
  ['touch-none', { 'touch-action': 'none' }],
]
