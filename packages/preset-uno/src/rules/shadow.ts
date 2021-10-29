import { Rule } from '@unocss/core'
import { Theme } from '../theme'

// TODO: support color and opacity
export const shadows: Rule<Theme>[] = [
  [/^shadow-?(.*)$/, ([, d], { theme }) => {
    const value = theme?.textShadow?.[d || 'DEFAULT']
    if (value) {
      return {
        '--un-shadow': value,
        '-webkit-box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
        'box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
      }
    }
  }],
]
