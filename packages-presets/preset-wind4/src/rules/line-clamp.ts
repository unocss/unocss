import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'

export const lineClamps: Rule<Theme>[] = [
  [/^line-clamp-(\d+)$/, ([, v]) => ({
    'overflow': 'hidden',
    'display': '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': v,
  }), { autocomplete: ['line-clamp', 'line-clamp-(1|2|3|4|5|6|none)'] }],
  ['line-clamp-none', {
    'overflow': 'visible',
    'display': 'block',
    '-webkit-box-orient': 'horizontal',
    '-webkit-line-clamp': 'unset',
  }],
]
