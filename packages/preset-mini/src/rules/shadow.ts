import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { boxShadowFns } from '../theme'
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
  [/^shadow-?(.*)$/, ([, d], { theme, options: { variablePrefix: p } }) => {
    d = d || 'DEFAULT'
    const value = boxShadowFns(p)?.[d] || theme.boxShadow?.[d]
    if (value) {
      return {
        [`--${p}shadow-color`]: '0,0,0',
        [`--${p}shadow`]: value,
        'box-shadow': `var(--${p}ring-offset-shadow, 0 0 #0000), var(--${p}ring-shadow, 0 0 #0000), var(--${p}shadow)`,
      }
    }
  }],
  [/^shadow-(.+)$/, ([, d], { theme }) => colorResolver(d, theme)],
]
