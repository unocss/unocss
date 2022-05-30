import type { Rule } from '@unocss/core'
import { varEmpty } from '@unocss/preset-mini/rules'

export const touchActionBase = {
  '--un-pan-x': varEmpty,
  '--un-pan-y': varEmpty,
  '--un-pinch-zoom': varEmpty,
  '--un-touch-action': 'var(--un-pan-x) var(--un-pan-y) var(--un-pinch-zoom)',
}

export const touchActions: Rule[] = [
  [/^touch-pan-(x|left|right)$/, ([, d]) => ({
    '--un-pan-x': `pan-${d}`,
    'touch-action': 'var(--un-touch-action)',
  }), { autocomplete: ['touch-pan', 'touch-pan-(x|left|right|y|up|down)'] }],
  [/^touch-pan-(y|up|down)$/, ([, d]) => ({
    '--un-pan-y': `pan-${d}`,
    'touch-action': 'var(--un-touch-action)',
  })],
  ['touch-pinch-zoom', {
    '--un-pinch-zoom': 'pinch-zoom',
    'touch-action': 'var(--un-touch-action)',
  }],

  ['touch-auto', { 'touch-action': 'auto' }],
  ['touch-manipulation', { 'touch-action': 'manipulation' }],
  ['touch-none', { 'touch-action': 'none' }],
]
