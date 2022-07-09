import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '../utils'
import { numberWithUnitRE } from '../utils/handlers/regex'

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
  [/^(?:color|c)-(.+)$/, colorResolver('color', 'text'), { autocomplete: '(text|color|c)-$colors' }],
  // auto detection and fallback to font-size if the content looks like a size
  [/^text-(.+)$/, colorResolver('color', 'text', css => !css.color?.toString().match(numberWithUnitRE)), { autocomplete: '(text|color|c)-$colors' }],
  [/^(?:text|color|c)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-opacity': h.bracket.percent(opacity) }), { autocomplete: '(text|color|c)-(op|opacity)-<percent>' }],
]

export const bgColors: Rule[] = [
  [/^bg-(.+)$/, colorResolver('background-color', 'bg'), { autocomplete: 'bg-$colors' }],
  [/^bg-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-bg-opacity': h.bracket.percent(opacity) }), { autocomplete: 'bg-(op|opacity)-<percent>' }],
]
