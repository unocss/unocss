import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '@unocss/preset-mini/utils'

export const placeholders: Rule[] = [
  [/^\$-placeholder-(.+)$/, colorResolver('color', 'placeholder')],
  [/^\$-placeholder-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-placeholder-opacity': h.bracket.percent.cssvar(opacity) })],
]
