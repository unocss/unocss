import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '@unocss/preset-mini/utils'

const listStyleProps = ['disc', 'circle', 'square', 'decimal', 'zero-decimal', 'greek', 'roman', 'upper-roman', 'alpha', 'upper-alpha']

export const listStyle: Rule[] = [
  [new RegExp(`^list-((?:${listStyleProps.join('|')})(?:-outside|-inside)?)$`), ([, value]) => {
    const style = value.split(/-outside|-inside/)[0]
    const position = /outside|inside/.exec(value) ?? []

    if (position.length) {
      return {
        'list-style-position': `${position[0]}`,
        'list-style-type': style,
      }
    }
    return { 'list-style-type': style }
  }],
  [/^list-(outside|inside)$/, ([, value]) => ({ 'list-style-position': value })],
  ['list-none', { 'list-style-type': 'none' }],
]

export const accentOpacity: Rule[] = [
  [/^accent-op(?:acity)?-?(.+)$/, ([, d]) => ({ '--un-accent-opacity': h.bracket.percent(d) })],
]

export const accentColors: Rule[] = [
  [/^accent-(.+)$/, colorResolver('accent-color', 'accent')],
]

export const caretOpacity: Rule[] = [
  [/^caret-op(?:acity)?-?(.+)$/, ([, d]) => ({ '--un-caret-opacity': h.bracket.percent(d) })],
]

export const caretColors: Rule[] = [
  [/^caret-(.+)$/, colorResolver('caret-color', 'caret')],
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

const overflowValues = [
  'auto',
  'hidden',
  'visible',
  'scroll',
  'contain',
]

export const overscrolls: Rule[] = [
  [/^overscroll-(.+)$/, ([, v]) => overflowValues.includes(v) ? { 'overscroll-behavior': v } : undefined],
  ['overscroll-none', { 'overscroll-behavior': 'none' }],
  [/^overscroll-([xy])-(.+)$/, ([, d, v]) => overflowValues.includes(v) ? { [`overscroll-behavior-${d}`]: v } : undefined],
  ['overscroll-x-none', { 'overscroll-behavior-x': 'none' }],
  ['overscroll-y-none', { 'overscroll-behavior-y': 'none' }],
]

export const scrollBehaviors: Rule[] = [
  ['scroll-auto', { 'scroll-behavior': 'auto' }],
  ['scroll-smooth', { 'scroll-behavior': 'smooth' }],
]
