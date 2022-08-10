import type { Rule } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { globalKeywords } from '@unocss/preset-mini/utils'

export const lineClamps: Rule<Theme>[] = [
  [/^line-clamp-(\d+)$/, ([, v]) => ({
    'overflow': 'hidden',
    'display': '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': v,
    'line-clamp': v,
  }), { autocomplete: ['line-clamp', 'line-clamp-<num>'] }],

  ...['none', ...globalKeywords].map<Rule<Theme>>(keyword => [`line-clamp-${keyword}`, {
    '-webkit-line-clamp': keyword,
    'line-clamp': keyword,
  }]),
]
