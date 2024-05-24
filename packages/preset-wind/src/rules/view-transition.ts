import type { Rule } from '@unocss/core'

export const viewTransition: Rule[] = [
  [/^view-transition-([\w-]+)$/, ([, name]) => {
    return { 'view-transition-name': name }
  }],
]
