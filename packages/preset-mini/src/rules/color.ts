import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, handler as h } from '../utils'

/**
 * @example op10 op-30 opacity-100
 */
export const opacity: Rule<Theme>[] = [
  [/^op(?:acity)?-?(.+)$/, ([, d], { theme }) => ({ opacity: theme.opacity?.[d] ?? h.bracket.percent.cssvar(d) })],
]

/**
 * @example c-red color-red5 text-red-300
 */
export const textColors: Rule<Theme>[] = [
  [/^(?:text|color|c)-(.+)$/, colorResolver('color', 'text')],
  [/^(?:text|color|c)-op(?:acity)?-?(.+)$/, ([, opacity], { theme }) => ({ '--un-text-opacity': theme.opacity?.[opacity] ?? h.bracket.percent(opacity) })],
]

export const bgColors: Rule<Theme>[] = [
  [/^bg-(.+)$/, colorResolver('background-color', 'bg')],
  [/^bg-op(?:acity)?-?(.+)$/, ([, opacity], { theme }) => ({ '--un-bg-opacity': theme.opacity?.[opacity] ?? h.bracket.percent(opacity) })],
]
