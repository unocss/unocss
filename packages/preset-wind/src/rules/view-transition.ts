import type { Rule } from '@unocss/core'

export const viewTransition: Rule[] = [
  [/^view-transition-([\w_-]+)$/, ([, name]) => {
    return { 'view-transition-name': name }
  }],
]
