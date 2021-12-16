import type { Rule } from '@unocss/core'
import { createColorOpacityRule, keywordResolver, sizePxResolver, createKeywordRules, colorResolver } from '../utils'

export const textDecorations: Rule[] = [
  ['underline', { 'text-decoration': 'underline' }],
  ['line-through', { 'text-decoration': 'line-through' }],
  ['decoration-underline', { 'text-decoration': 'underline' }],
  ['decoration-line-through', { 'text-decoration': 'line-through' }],

  // style
  ...createKeywordRules(['underline', 'decoration'], 'text-decoration-style', [
    'dashed',
    'dotted',
    'double',
    'solid',
    'wavy',
  ]),

  // size
  [/^(?:underline|decoration)-(?:size-)?(.+)$/, sizePxResolver('text-decoration-thickness')],
  [/^(?:underline|decoration)-(?:size-)?(.+)$/, keywordResolver('text-decoration-thickness', [
    'auto',
    'from-front',
  ])],
  [/^underline-offset-(.+)$/, sizePxResolver('text-underline-offset')],
  ['underline-offset-auto', { 'text-underline-offset': 'auto' }],

  // colors
  [/^(?:underline|decoration)-(.+)$/, (match, ctx) => {
    const result = colorResolver('text-decoration-color', 'line')(match, ctx)
    if (result) {
      return {
        '-webkit-text-decoration-color': result['text-decoration-color'],
        ...result,
      }
    }
  }],
  createColorOpacityRule('decoration', 'line'),
  createColorOpacityRule('underline', 'line'),

  ['no-underline', { 'text-decoration': 'none' }],
  ['decoration-none', { 'text-decoration': 'none' }],
]
