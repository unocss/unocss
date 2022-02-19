import type { Rule } from '@unocss/core'
import { CONTROL_SHORTCUT_NO_MERGE } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, colorableShadows, handler as h } from '../utils'
import { varEmpty } from './static'

export const boxShadows: Rule<Theme>[] = [
  [/^shadow(?:-(.+))?$/, ([, d], { theme }) => {
    const v = theme.boxShadow?.[d || 'DEFAULT']
    if (v) {
      return [
        {
          [CONTROL_SHORTCUT_NO_MERGE]: '',
          '--un-shadow-inset': varEmpty,
          '--un-shadow': '0 0 #0000',
        },
        {
          '--un-shadow': colorableShadows(v, '--un-shadow-color').join(','),
          'box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
        },
      ]
    }
  }],

  // color
  [/^shadow-(.+)$/, colorResolver('--un-shadow-color', 'shadow')],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent(opacity) })],

  // inset
  ['shadow-inset', { '--un-shadow-inset': 'inset' }],
]
