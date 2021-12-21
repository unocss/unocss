import type { CSSObject, Rule } from '@unocss/core'
import { colorResolver, handler as h } from '../utils'

export const textDecorations: Rule[] = [
  ['underline', { 'text-decoration': 'underline' }],
  ['line-through', { 'text-decoration': 'line-through' }],
  ['decoration-underline', { 'text-decoration': 'underline' }],
  ['decoration-line-through', { 'text-decoration': 'line-through' }],

  // style
  [/^(?:underline|decoration)-(solid|double|dotted|dashed|wavy)$/, ([, d]) => ({ 'text-decoration-style': d })],

  // thickness
  [/^(?:underline|decoration)-([^-]+)$/, ([, s]) => ({ 'text-decoration-thickness': ['auto', 'from-font'].includes(s) ? s : h.bracket.px(s) })],
  [/^decoration-(.+)$/, ([, d]) => ({ 'text-decoration-thickness': h.bracket.px(d) })],

  // offset
  [/^underline-offset-([^-]+)$/, ([, s]) => {
    const v = s === 'auto' ? s : h.bracket.px(s)
    if (v != null)
      return { 'text-underline-offset': v }
  }],

  // colors
  [/^(?:underline|decoration)-(.+)$/, (match, ctx) => {
    const result = colorResolver('text-decoration-color', 'line')(match, ctx) as CSSObject | undefined
    if (result) {
      return {
        '-webkit-text-decoration-color': result['text-decoration-color'],
        ...result,
      }
    }
  }],
  [/^(?:underline|decoration)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-line-opacity': h.bracket.percent(opacity) })],

  ['no-underline', { 'text-decoration': 'none' }],
  ['decoration-none', { 'text-decoration': 'none' }],
]
