import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { parseColor } from '../utils'

const colorResolver = (body: string, theme: Theme) => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { color, rgba } = data

  if (!color)
    return

  if (rgba) {
    // shadow opacity ignored
    return {
      '--un-shadow-color': `${rgba.slice(0, 3).join(',')}`,
    }
  }
  else {
    return {
      '--un-shadow-color': color,
    }
  }
}

export const boxShadows: Rule<Theme>[] = [
  [/^shadow-?(.*)$/, ([, d], { theme }) => {
    const value = theme.boxShadow?.[d || 'DEFAULT']
    if (value) {
      return {
        '--un-shadow-color': '0,0,0',
        '--un-shadow': value,
        'box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
      }
    }
  }],
  [/^shadow-(.+)$/, ([, d], { theme }) => colorResolver(d, theme)],
]
