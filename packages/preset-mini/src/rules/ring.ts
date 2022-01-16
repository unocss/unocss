import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, handler as h } from '../utils'
import { shadowBase } from './shadow'
import { varEmpty } from './static'

const ringBase = {
  '--un-ring-inset': varEmpty,
  '--un-ring-offset-width': '0px',
  '--un-ring-offset-color': '#fff',
  '--un-ring-color': 'rgba(147,197,253,0.5)',
  ...shadowBase,
}

export const rings: Rule<Theme>[] = [
  // size
  [/^ring(?:-(.+))?$/, ([, d]) => {
    const value = h.px(d || '1')
    if (value) {
      return [
        ringBase,
        {
          '--un-ring-offset-shadow': 'var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color)',
          '--un-ring-shadow': `var(--un-ring-inset) 0 0 0 calc(${value} + var(--un-ring-offset-width)) var(--un-ring-color)`,
          'box-shadow': 'var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow, 0 0 #0000)',
        },
      ]
    }
  }],

  // offset size
  ['ring-offset', { '--un-ring-offset-width': '1px' }],
  [/^ring-offset-(?:width-|size-)?(.+)$/, ([, d]) => ({ '--un-ring-offset-width': h.bracket.cssvar.px(d) })],

  // colors
  [/^ring-(.+)$/, colorResolver('--un-ring-color', 'ring')],
  [/^ring-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-ring-opacity': h.bracket.percent(opacity) })],

  // offset color
  [/^ring-offset-(.+)$/, colorResolver('--un-ring-offset-color', 'ring-offset')],
  [/^ring-offset-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-ring-offset-opacity': h.bracket.percent(opacity) })],

  // style
  ['ring-inset', { '--un-ring-inset': 'inset' }],
]
