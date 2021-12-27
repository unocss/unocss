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
  [/^(?:text|color|c)-(.+)$/, colorResolver('color', 'text')],
  [/^(?:text|color|c)-op(?:acity)?-?(.+)$/, ([, opacity], { options: { variablePrefix: p } }) => ({ [`--${p}text-opacity`]: h.bracket.percent.cssvar(opacity) })],
]

export const bgColors: Rule[] = [
  [/^bg-(.+)$/, colorResolver('background-color', 'bg')],
  [/^bg-op(?:acity)?-?(.+)$/, ([, opacity], { options: { variablePrefix: p } }) => ({ [`--${p}bg-opacity`]: h.bracket.percent(opacity) })],
]
