import type { Rule } from '@unocss/core'
import { varEmpty } from '@unocss/preset-mini/rules'
import { makeGlobalStaticRules } from '@unocss/preset-mini/utils'

export const touchActionBase = {
  '--un-pan-x': varEmpty,
  '--un-pan-y': varEmpty,
  '--un-pinch-zoom': varEmpty,
}
const custom = { preflightKeys: Object.keys(touchActionBase) }
const touchActionProperty = 'var(--un-pan-x) var(--un-pan-y) var(--un-pinch-zoom)'

export const touchActions: Rule[] = [
  [/^touch-pan-(x|left|right)$/, ([, d]) => ({
    '--un-pan-x': `pan-${d}`,
    'touch-action': touchActionProperty,
  }), { custom, autocomplete: ['touch-pan', 'touch-pan-(x|left|right|y|up|down)'] }],
  [/^touch-pan-(y|up|down)$/, ([, d]) => ({
    '--un-pan-y': `pan-${d}`,
    'touch-action': touchActionProperty,
  }), { custom }],
  ['touch-pinch-zoom', {
    '--un-pinch-zoom': 'pinch-zoom',
    'touch-action': touchActionProperty,
  }, { custom }],

  ['touch-auto', { 'touch-action': 'auto' }],
  ['touch-manipulation', { 'touch-action': 'manipulation' }],
  ['touch-none', { 'touch-action': 'none' }],
  ...makeGlobalStaticRules('touch', 'touch-action'),
]
