import type { Rule } from '@unocss/core'
import { createColorAndOpacityRulePair, handler as h } from '../utils'

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
  ...createColorAndOpacityRulePair('c', 'color', 'text'),
  ...createColorAndOpacityRulePair('color', 'color', 'text'),
  ...createColorAndOpacityRulePair('text', 'color'),
]

export const bgColors: Rule[] = [
  ...createColorAndOpacityRulePair('bg', 'background-color'),
]
