import type { Rule } from '@unocss/core'

const verticalAlignAlias: Record<string, string> = {
  mid: 'middle',
  base: 'baseline',
  btm: 'bottom',
}

export const verticalAligns: Rule[] = [
  [/^(?:vertical|align|v)-(baseline|top|middle|bottom|text-top|text-bottom|sub|super|mid|base|btm)$/, ([, v]) => ({ 'vertical-align': verticalAlignAlias[v] || v }), { autocomplete: '(vertical|align|v)-(baseline|top|middle|bottom|text-top|text-bottom|sub|super|mid|base|btm)' }],
]

export const textAligns: Rule[] = [
  ['text-center', { 'text-align': 'center' }],
  ['text-left', { 'text-align': 'left' }],
  ['text-right', { 'text-align': 'right' }],
  ['text-justify', { 'text-align': 'justify' }],
]
