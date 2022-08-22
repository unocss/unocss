import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, colorableShadows, handler as h } from '../utils'
import { varEmpty } from './static'

export const boxShadowsBase = {
  '--un-ring-offset-shadow': '0 0 rgba(0,0,0,0)',
  '--un-ring-shadow': '0 0 rgba(0,0,0,0)',
  '--un-shadow-inset': varEmpty,
  '--un-shadow': '0 0 rgba(0,0,0,0)',
}

export const boxShadows: Rule<Theme>[] = [
  [/^shadow(?:-(.+))?$/, ([, d], { theme }) => {
    const v = theme.boxShadow?.[d || 'DEFAULT']
    if (v) {
      return {
        '--un-shadow': colorableShadows(v, '--un-shadow-color').join(','),
        'box-shadow': 'var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
      }
    }
  }, { autocomplete: 'shadow-$boxShadow' }],

  // color
  [/^shadow-(.+)$/, colorResolver('--un-shadow-color', 'shadow'), { autocomplete: 'shadow-$colors' }],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent(opacity) }), { autocomplete: 'shadow-(op|opacity)-<percent>' }],

  // inset
  ['shadow-inset', { '--un-shadow-inset': 'inset' }],
]
