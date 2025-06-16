import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, h } from '../utils'
import { shadowProperties } from './shadow'

export const rings: Rule<Theme>[] = [
  // ring
  [/^ring(?:-(.+))?$/, ([, d]) => {
    const v = h.bracket.px(d || '1')
    if (v != null) {
      return [
        {
          '--un-ring-shadow': `var(--un-ring-inset,) 0 0 0 calc(${v} + var(--un-ring-offset-width)) var(--un-ring-color, currentColor)`,
          'box-shadow': 'var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
        },
        ...Object.values(shadowProperties),
      ]
    }
  }],
  [/^ring-(.+)$/, colorResolver(`--un-ring-color`, 'ring'), { autocomplete: 'ring-$colors' }],
  [/^ring-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-ring-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'ring-(op|opacity)-<percent>' }],

  // inset ring
  [/^inset-ring(?:-(.+))?$/, ([, d]) => {
    const v = h.bracket.px(d || '1')
    if (v != null) {
      return [
        {
          '--un-inset-ring-shadow': `inset 0 0 0 ${v} var(--un-inset-ring-color, currentColor)`,
          'box-shadow': 'var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
        },
        ...Object.values(shadowProperties),
      ]
    }
  }],
  [/^inset-ring-(.+)$/, colorResolver(`--un-inset-ring-color`, 'inset-ring'), { autocomplete: 'inset-ring-$colors' }],
  [/^inset-ring-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-inset-ring-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'inset-ring-(op|opacity)-<percent>' }],

  // offset
  [/^ring-offset(?:-(?:width-|size-)?(.+))?$/, ([, d]) => {
    const v = h.bracket.cssvar.px(d || '1')
    if (v != null) {
      return {
        '--un-ring-offset-width': v,
        '--un-ring-offset-shadow': 'var(--un-ring-inset,) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color)',
      }
    }
  }, { autocomplete: 'ring-offset-$colors' }],
  [/^ring-offset-(.+)$/, colorResolver(`--un-ring-offset-color`, 'ring-offset'), { autocomplete: 'ring-offset-$colors' }],
  [/^ring-offset-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-ring-offset-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'ring-offset-(op|opacity)-<percent>' }],

  // style
  ['ring-inset', { '--un-ring-inset': 'inset' }],
]
