import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '@unocss/preset-mini/utils'

export const listStyle: Rule[] = [
  // base
  [/^list-(disc|circle|square|decimal|zero-decimal|greek|roman|upper-roman|alpha|upper-alpha)(?:-(outside|inside))?$/, ([, style, position]) => {
    if (position != null) {
      return {
        'list-style-position': position,
        'list-style-type': style,
      }
    }

    return { 'list-style-type': style }
  }, { autocomplete: ['list-(disc|circle|square|decimal|zero-decimal|greek|roman|upper-roman|alpha|upper-alpha)', 'list-(disc|circle|square|decimal|zero-decimal|greek|roman|upper-roman|alpha|upper-alpha)-(outside|inside)'] }],

  // styles
  ['list-outside', { 'list-style-position': 'outside' }],
  ['list-inside', { 'list-style-position': 'inside' }],
  ['list-none', { 'list-style-type': 'none' }],
]

export const accents: Rule[] = [
  [/^accent-(.+)$/, colorResolver('accent-color', 'accent'), { autocomplete: 'accent-$colors' }],
  [/^accent-op(?:acity)?-?(.+)$/, ([, d]) => ({ '--un-accent-opacity': h.bracket.percent(d) }), { autocomplete: ['accent-(op|opacity)', 'accent-(op|opacity)-<percent>'] }],
]

export const carets: Rule[] = [
  [/^caret-(.+)$/, colorResolver('caret-color', 'caret'), { autocomplete: 'caret-$colors' }],
  [/^caret-op(?:acity)?-?(.+)$/, ([, d]) => ({ '--un-caret-opacity': h.bracket.percent(d) }), { autocomplete: ['caret-(op|opacity)', 'caret-(op|opacity)-<percent>'] }],
]

export const imageRenderings: Rule[] = [
  ['image-render-auto', { 'image-rendering': 'auto' }],
  ['image-render-edge', { 'image-rendering': 'crisp-edges' }],
  ['image-render-pixel', [
    ['-ms-interpolation-mode', 'nearest-neighbor'],
    ['image-rendering', '-webkit-optimize-contrast'],
    ['image-rendering', '-moz-crisp-edges'],
    ['image-rendering', '-o-pixelated'],
    ['image-rendering', 'pixelated'],
  ]],
]

export const overscrolls: Rule[] = [
  ['overscroll-auto', { 'overscroll-behavior': 'auto' }],
  ['overscroll-contain', { 'overscroll-behavior': 'contain' }],
  ['overscroll-none', { 'overscroll-behavior': 'none' }],
  ['overscroll-x-auto', { 'overscroll-behavior-x': 'auto' }],
  ['overscroll-x-contain', { 'overscroll-behavior-x': 'contain' }],
  ['overscroll-x-none', { 'overscroll-behavior-x': 'none' }],
  ['overscroll-y-auto', { 'overscroll-behavior-y': 'auto' }],
  ['overscroll-y-contain', { 'overscroll-behavior-y': 'contain' }],
  ['overscroll-y-none', { 'overscroll-behavior-y': 'none' }],
]

export const scrollBehaviors: Rule[] = [
  ['scroll-auto', { 'scroll-behavior': 'auto' }],
  ['scroll-smooth', { 'scroll-behavior': 'smooth' }],
]
