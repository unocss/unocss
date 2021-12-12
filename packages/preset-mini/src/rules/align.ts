import type { Rule } from '@unocss/core'

const verticalAlignAlias: Record<string, string> = {
  mid: 'middle',
  base: 'baseline',
  btm: 'bottom',
}

export const verticalAligns: Rule[] = [
  [/^(?:vertical|align|v)-(baseline|top|bottom|middle|text-top|text-bottom|mid|base|btm)$/, ([, v]) => ({ 'vertical-align': verticalAlignAlias[v] || v })],
]

export const textAligns: Rule[] = [
  ['text-center', { 'text-align': 'center' }],
  ['text-left', { 'text-align': 'left' }],
  ['text-right', { 'text-align': 'right' }],
  ['text-justify', { 'text-align': 'justify' }],
]
