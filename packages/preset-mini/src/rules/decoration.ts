import { Rule } from '@unocss/core'
import { handler as h } from '../utils'

export const textDecorations: Rule[] = [
  ['underline', { 'text-decoration': 'underline' }],
  ['line-through', { 'text-decoration': 'line-through' }],
  ['no-underline', { 'text-decoration': 'none' }],
  ['decoration-underline', { 'text-decoration': 'underline' }],
  ['decoration-line-through', { 'text-decoration': 'line-through' }],
  ['decoration-none', { 'text-decoration': 'none' }],

  // style
  [/^(?:underline|decoration)-(solid|double|dotted|dashed|wavy)$/, ([, d]) => ({ 'text-decoration-style': d })],

  // thickness
  [/^(?:underline|decoration)-([^-]+)$/, ([, s]) => ({ 'text-decoration-thickness': ['auto', 'from-font'].includes(s) ? s : h.bracket.px(s) })],
  [/^decoration-(.*)$/, ([, d]) => ({ 'text-decoration-thickness': h.bracket.px(d) })],

  // offset
  [/^underline-offset-([^-]+)$/, ([, s]) => {
    const v = s === 'auto' ? s : h.bracket.px(s)
    if (v != null)
      return { 'text-underline-offset': v }
  }],
]
