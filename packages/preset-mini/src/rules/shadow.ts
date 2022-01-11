import type { CSSObject, Rule } from '@unocss/core'
import { CONTROL_SHORTCUT_NO_MERGE, toArray } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, handler as h } from '../utils'
import { varEmpty } from './static'

export const shadowBase = {
  [CONTROL_SHORTCUT_NO_MERGE]: '',
  '--un-ring-offset-shadow': '0 0 #0000',
  '--un-ring-shadow': '0 0 #0000',
  '--un-shadow-inset': varEmpty,
  '--un-shadow': '0 0 #0000',
  '--un-shadow-colored': '0 0 #0000',
}

export const boxShadows: Rule<Theme>[] = [
  [/^shadow(?:-(.+))?$/, ([, d], { theme }) => {
    const v = theme.boxShadow?.[d || 'DEFAULT']
    if (v) {
      const shadow = toArray(v)
      const colored = shadow.map(s => s.replace(/\s\S+$/, ' var(--un-shadow-color)'))
      return [
        shadowBase,
        {
          '--un-shadow': shadow.join(','),
          '--un-shadow-colored': colored.join(','),
          'box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
        },
      ]
    }
  }],

  // color
  [/^shadow-(.+)$/, (m, ctx) => {
    const color = colorResolver('--un-shadow-color', 'shadow')(m, ctx) as CSSObject | undefined
    if (color) {
      return {
        ...color,
        '--un-shadow': 'var(--un-shadow-colored)',
      }
    }
  }],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent.cssvar(opacity) })],

  // inset
  ['shadow-inset', { '--un-shadow-inset': 'inset' }],
]
