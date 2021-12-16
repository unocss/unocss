import type { Rule } from '@unocss/core'
import { createColorOpacityRule, createColorRule, createKeywordRules } from '@unocss/preset-mini/utils'

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
  ...createKeywordRules('list', 'list-style-position', [
    'inside',
    'outside',
  ]),
  ['list-none', { 'list-style-type': 'none' }],
]

export const boxDecorationBreaks: Rule[] = [
  ...createKeywordRules('decoration', 'box-decoration-break', [
    'clone',
    'slice',
  ]),
]

export const accentOpacity: Rule[] = [
  createColorOpacityRule('accent'),
]

export const accentColors: Rule[] = [
  createColorRule('accent', 'accent-color'),
]

export const caretOpacity: Rule[] = [
  createColorOpacityRule('caret'),
]

export const caretColors: Rule[] = [
  createColorRule('caret', 'caret-color'),
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
  ...createKeywordRules('scroll', 'scroll-behavior', [
    'auto',
    'smooth',
  ]),
]
