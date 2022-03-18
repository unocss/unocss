import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '../utils'

/**
 * @example op10 op-30 opacity-100
 */
export const opacity: Rule[] = [
  [/^op(?:acity)?-?(.+)$/, ([, d]) => ({ opacity: h.bracket.percent.cssvar(d) })],
]

/**
 * @example c-red color-red5 text-red-300
 */
export const textColors: Rule[] = [
  [/^(?:text|color|c)-(.+)$/, colorResolver('color', 'text'), { autocomplete: '(text|color|c)-$colors' }],
  [/^(?:text|color|c)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-opacity': h.bracket.percent(opacity) }), { autocomplete: '(text|color|c)-(op|opacity)-<percent>' }],
]

export const bgColors: Rule[] = [
  [/^bg-(.+)$/, (match, ctx) => {
    const [, d] = match
    if (/^\[length:/.test(d) && h.bracketOfLength(d) != null)
      return { 'background-size': h.bracketOfLength(d)!.split(' ').map(e => h.fraction.auto.px.cssvar(e)).join(' ') }
    else if (/^\[url\(.*\)\]$/.test(d)) return { '--un-url': `${h.bracket(d)}`, 'background-image': 'var(--un-url)' }
    else return colorResolver('background-color', 'bg')(match, ctx)
  }, { autocomplete: 'bg-$colors' }],
  [/^bg-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-bg-opacity': h.bracket.percent(opacity) }), { autocomplete: 'bg-(op|opacity)-<percent>' }],
]
