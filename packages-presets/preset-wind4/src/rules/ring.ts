import type { CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, h } from '../utils'
import { varEmpty } from './static'

export const ringBase = {
  '--un-ring-inset': varEmpty,
  '--un-ring-offset-width': '0px',
  '--un-ring-offset-color': '#fff',
  '--un-ring-width': '0px',
  '--un-ring-color': 'rgb(147 197 253 / 0.5)',
  '--un-shadow': '0 0 rgb(0 0 0 / 0)',
}
const preflightKeys = Object.keys(ringBase)

export const rings: Rule<Theme>[] = [
  // ring
  [/^ring(?:-(.+))?$/, ([, d]) => {
    const v = h.px(d || '1')
    if (v != null) {
      return {
        '--un-ring-shadow': `var(--un-ring-inset) 0 0 0 calc(${v} + var(--un-ring-offset-width)) var(--un-ring-color, currentColor)`,
        'box-shadow': 'var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
      }
    }
  }, { custom: { preflightKeys }, autocomplete: 'ring-$ringWidth' }],
  [/^ring-(.+)$/, createHandleColor('ring'), { autocomplete: 'ring-$colors' }],
  [/^ring-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-ring-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'ring-(op|opacity)-<percent>' }],

  // inset ring
  [/^inset-ring(?:-(.+))?$/, ([, d]) => {
    const v = h.px(d || '1')
    if (v != null) {
      return {
        '--un-inset-ring-shadow': `inset 0 0 0 ${v} var(--un-inset-ring-color, currentColor)`,
        'box-shadow': 'var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
      }
    }
  }],
  [/^inset-ring-(.+)$/, createHandleColor('inset-ring'), { autocomplete: 'inset-ring-$colors' }],
  [/^inset-ring-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-inset-ring-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'inset-ring-(op|opacity)-<percent>' }],

  // offset
  [/^ring-offset(?:-(.+))?$/, ([, d]) => {
    const v = h.px(d || '1')
    if (v != null) {
      return {
        '--un-ring-offset-width': v,
        '--un-ring-offset-shadow': 'var(--un-ring-inset,) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color)',
      }
    }
  }, { autocomplete: 'ring-offset-$colors' }],
  [/^ring-offset-(.+)$/, createHandleColor('ring-offset'), { autocomplete: 'ring-offset-$colors' }],
  [/^ring-offset-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-ring-offset-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'ring-offset-(op|opacity)-<percent>' }],
  [/^ring-offset-(?:width-|size-)?(.+)$/, ([, d]) => ({ '--un-ring-offset-width': h.bracket.cssvar.px(d) })],

  // style
  ['ring-inset', { '--un-ring-inset': 'inset' }],
]

function createHandleColor(property: string) {
  return (match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | undefined => {
    return colorResolver(`--un-${property}-color`, property)(match, ctx) as CSSObject | undefined
  }
}
