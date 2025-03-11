import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { defineProperty, makeGlobalStaticRules } from '../utils'

const touchActionValue = 'var(--un-pan-x) var(--un-pan-y) var(--un-pinch-zoom)'
const touchActionProperty = ['pan-x', 'pan-y', 'pinch-zoom'].map(d => defineProperty(`--un-${d}`)).join('\n')

export const touchActions: Rule<Theme>[] = [
  [/^touch-pan-(x|left|right)$/, function*([, d]) {
    yield {
      '--un-pan-x': `pan-${d}`,
      'touch-action': touchActionValue,
    }
    yield touchActionProperty
  }, { autocomplete: ['touch-pan', 'touch-pan-(x|left|right|y|up|down)'] }],
  [/^touch-pan-(y|up|down)$/, function*([, d]) {
    yield {
      '--un-pan-y': `pan-${d}`,
      'touch-action': touchActionValue,
    }
    yield touchActionProperty
  }],
  [/^touch-pinch-zoom$/, function*() {
    yield {
      '--un-pinch-zoom': 'pinch-zoom',
      'touch-action': touchActionValue,
    }
    yield touchActionProperty
  }],

  ['touch-auto', { 'touch-action': 'auto' }],
  ['touch-manipulation', { 'touch-action': 'manipulation' }],
  ['touch-none', { 'touch-action': 'none' }],
  ...makeGlobalStaticRules('touch', 'touch-action'),
]
