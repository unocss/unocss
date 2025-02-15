import type { Rule } from '@unocss/core'

export const containerParent: Rule[] = [
  [/^@container(?:\/(\w+))?(?:-(normal|inline-size|size))?$/, ([, l, v]) => {
    return {
      'container-type': v ?? 'inline-size',
      'container-name': l,
    }
  }],
]
