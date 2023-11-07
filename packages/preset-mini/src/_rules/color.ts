import type { Rule } from '@unocss/core'
import { colorResolver, globalKeywords, h, isSize } from '../utils'
import { numberWithUnitRE } from '../_utils/handlers/regex'

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
  [/^(?:color|c)-(.+)$/, colorResolver('color', 'text'), { autocomplete: '(color|c)-$colors' }],
  // auto detection and fallback to font-size if the content looks like a size
  [/^text-(.+)$/, colorResolver('color', 'text', css => !css.color?.toString().match(numberWithUnitRE)), { autocomplete: 'text-$colors' }],
  [/^(?:text|color|c)-(.+)$/, ([, v]) => globalKeywords.includes(v) ? { color: v } : undefined, { autocomplete: `(text|color|c)-(${globalKeywords.join('|')})` }],
  [/^(?:text|color|c)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-text-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: '(text|color|c)-(op|opacity)-<percent>' }],
]

export const bgColors: Rule[] = [
  [/^bg-(.+)$/, (...args) => isSize(args[0][1]) ? undefined : colorResolver('background-color', 'bg')(...args), { autocomplete: 'bg-$colors' }],
  [/^bg-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-bg-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'bg-(op|opacity)-<percent>' }],
]

export const colorScheme: Rule[] = [
  [/^color-scheme-(\w+)$/, ([, v]) => ({ 'color-scheme': v })],
]
