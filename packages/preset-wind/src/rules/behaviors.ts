import type { Rule } from '@unocss/core'
import { colorResolver, handler as h, makeGlobalStaticRules } from '@unocss/preset-mini/utils'

const listStyles: Record<string, string> = {
  'disc': 'disc',
  'circle': 'circle',
  'square': 'square',
  'decimal': 'decimal',
  'zero-decimal': 'decimal-leading-zero',
  'greek': 'lower-greek',
  'roman': 'lower-roman',
  'upper-roman': 'upper-roman',
  'alpha': 'lower-alpha',
  'upper-alpha': 'upper-alpha',
  'latin': 'lower-latin',
  'upper-latin': 'upper-latin',
}

export const listStyle: Rule[] = [
  // base
  [/^list-(.+)(?:-(outside|inside))?$/, ([, style, position]) => {
    if (position != null) {
      return {
        'list-style-position': position,
        'list-style-type': listStyles[style],
      }
    }
    return { 'list-style-type': listStyles[style] }
  }, { autocomplete: [`list-(${Object.keys(listStyles).join('|')})`, `list-(${Object.keys(listStyles).join('|')})-(outside|inside)`] }],
  // styles
  ['list-outside', { 'list-style-position': 'outside' }],
  ['list-inside', { 'list-style-position': 'inside' }],
  ['list-none', { 'list-style-type': 'none' }],
  ...makeGlobalStaticRules('list', 'list-style'),
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
  ...makeGlobalStaticRules('overscroll', 'overscroll-behavior'),
  ['overscroll-x-auto', { 'overscroll-behavior-x': 'auto' }],
  ['overscroll-x-contain', { 'overscroll-behavior-x': 'contain' }],
  ['overscroll-x-none', { 'overscroll-behavior-x': 'none' }],
  ...makeGlobalStaticRules('overscroll-x', 'overscroll-behavior-x'),
  ['overscroll-y-auto', { 'overscroll-behavior-y': 'auto' }],
  ['overscroll-y-contain', { 'overscroll-behavior-y': 'contain' }],
  ['overscroll-y-none', { 'overscroll-behavior-y': 'none' }],
  ...makeGlobalStaticRules('overscroll-y', 'overscroll-behavior-y'),
]

export const scrollBehaviors: Rule[] = [
  ['scroll-auto', { 'scroll-behavior': 'auto' }],
  ['scroll-smooth', { 'scroll-behavior': 'smooth' }],
  ...makeGlobalStaticRules('scroll', 'scroll-behavior'),
]
