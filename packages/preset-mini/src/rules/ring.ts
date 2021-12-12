import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from '../utils'
import { ringColors, ringOffsetColors } from './color'

export const rings: Rule<Theme>[] = [
  // size
  [/^ring-?(.*)$/, ([, d]) => {
    const value = h.px(d || '1')
    if (value) {
      return {
        '--un-ring-inset': 'var(--un-empty, )',
        '--un-ring-offset-width': '0px',
        '--un-ring-offset-color': '#fff',
        '--un-ring-color': 'rgba(59, 130, 246, .5)',
        '--un-ring-offset-shadow': 'var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color)',
        '--un-ring-shadow': `var(--un-ring-inset) 0 0 0 calc(${value} + var(--un-ring-offset-width)) var(--un-ring-color)`,
        '-webkit-box-shadow': 'var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow, 0 0 #0000);',
        'box-shadow': 'var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow, 0 0 #0000);',
      }
    }
  }],
  [/^ring-offset-?(.*)$/, ([, d]) => {
    const value = h.px(d || '1')
    if (value) {
      return {
        '--un-ring-offset-width': value,
      }
    }
  }],
  ['ring-inset', { '--un-ring-inset': 'inset' }],
  ...ringColors,
  ...ringOffsetColors,
]
