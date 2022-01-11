import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '@unocss/preset-mini/utils'

export const placeholders: Rule[] = [
  // The prefix `$ ` is intentional. This rule is not to be matched directly from user-generated token.
  // See variants/placeholder.
  [/^\$ placeholder-(.+)$/, colorResolver('color', 'placeholder')],
  [/^\$ placeholder-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-placeholder-opacity': h.bracket.percent.cssvar(opacity) })],
]
