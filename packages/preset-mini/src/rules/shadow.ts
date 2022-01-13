import type { Rule } from '@unocss/core'
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
}

export const colorableShadows = (shadows: string | string[], colorVar: string) => {
  const colored = []
  shadows = toArray(shadows)
  for (let i = 0; i < shadows.length; i++) {
    const [size, color] = shadows[i].split(/\s(\S+)$/)
    if (color.split('(').length !== color.split(')').length)
      return shadows
    colored.push(`${size} var(${colorVar}, ${color})`)
  }
  return colored
}

export const boxShadows: Rule<Theme>[] = [
  [/^shadow(?:-(.+))?$/, ([, d], { theme }) => {
    const v = theme.boxShadow?.[d || 'DEFAULT']
    if (v) {
      return [
        shadowBase,
        {
          '--un-shadow': colorableShadows(v, '--un-shadow-color').join(','),
          'box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
        },
      ]
    }
  }],

  // color
  [/^shadow-(.+)$/, colorResolver('--un-shadow-color', 'shadow')],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent.cssvar(opacity) })],

  // inset
  ['shadow-inset', { '--un-shadow-inset': 'inset' }],
]
