import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { parseColor } from '../utils'

const colorResolver = (body: string, variablePrefix: string, theme: Theme) => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { color, rgba } = data

  if (!color)
    return

  if (rgba) {
    // shadow opacity ignored
    return {
      [`--${variablePrefix}shadow-color`]: `${rgba.slice(0, 3).join(',')}`,
    }
  }
  else {
    return {
      [`--${variablePrefix}shadow-color`]: color,
    }
  }
}

export const boxShadows: Rule<Theme>[] = [
  [/^shadow-?(.*)$/, ([, d], { theme, options: { variablePrefix: p } }) => {
    const value = theme.boxShadow?.[d || 'DEFAULT']
    if (value) {
      return {
        [`--${p}shadow-color`]: '0,0,0',
        [`--${p}shadow`]: value,
        'box-shadow': `var(--${p}ring-offset-shadow, 0 0 #0000), var(--${p}ring-shadow, 0 0 #0000), var(--${p}shadow)`,
      }
    }
  }],
  [/^shadow-(.+)$/, ([, d], { theme, options }) => colorResolver(d, options.variablePrefix, theme)],
]
