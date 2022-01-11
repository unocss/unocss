import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h, parseColor } from '../utils'
import { varEmpty } from './static'

const shadowColorResolver = (body: string, theme: Theme) => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { alpha, opacity, color, rgba } = data

  if (!color)
    return

  if (rgba) {
    if (alpha != null) {
      return {
        '--un-shadow-opacity': rgba[3],
        '--un-shadow-color': rgba.slice(0, 3).join(','),
      }
    }
    else {
      return {
        '--un-shadow-opacity': (opacity && h.cssvar(opacity)) ?? 1,
        '--un-shadow-color': rgba.join(','),
      }
    }
  }
  else {
    return {
      '--un-shadow-color': color,
    }
  }
}

export const boxShadows: Rule<Theme>[] = [
  [/^shadow(?:-(.+))?$/, ([, d], { theme }) => {
    const value = theme.boxShadow?.[d || 'DEFAULT']
    if (value) {
      return {
        '--un-shadow-inset': varEmpty,
        '--un-shadow-color': '0,0,0',
        '--un-shadow': value,
        'box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
      }
    }
  }],
  [/^shadow-(.+)$/, ([, d], { theme }) => shadowColorResolver(d, theme)],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent.cssvar(opacity) })],
  ['shadow-inset', { '--un-shadow-inset': 'inset' }],
]
