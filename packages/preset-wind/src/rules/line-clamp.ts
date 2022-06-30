import type { Rule } from '@unocss/core'
import { globalKeywords } from '@unocss/preset-mini/utils'

export const lineClamps: Rule[] = [
  [/^line-clamp-(\d+)$/, ([, v]) => ({
    'overflow': 'hidden',
    'display': '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': v,
    'line-clamp': v,
  }), { autocomplete: ['line-clamp', 'line-clamp-<num>'] }],

  ...['none', ...globalKeywords].map(keyword => [`line-clamp-${keyword}`, {
    '-webkit-line-clamp': keyword,
    'line-clamp': keyword,
  }] as Rule),
]
