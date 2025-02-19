import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, h } from '../utils'

export const placeholders: Rule<Theme>[] = [
  // The prefix `$ ` is intentional. This rule is not to be matched directly from user-generated token.
  // See variants/placeholder.
  [/^\$ placeholder-(.+)$/, colorResolver('color', 'placeholder'), { autocomplete: 'placeholder-$colors' }],
  [/^\$ placeholder-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-placeholder-opacity': h.bracket.percent(opacity) }), { autocomplete: ['placeholder-(op|opacity)', 'placeholder-(op|opacity)-<percent>'] }],
]
