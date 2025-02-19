import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'

export const viewTransition: Rule<Theme>[] = [
  [/^view-transition-([\w-]+)$/, ([, name]) => {
    return { 'view-transition-name': name }
  }],
]
