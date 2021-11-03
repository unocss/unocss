import { Rule } from '@unocss/core'
import { handler as h } from '../utils'
import { colorResolver } from './color'

const outlineStyle = [
  'auto',
  'none',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
  'inherit',
  'initial',
  'revert',
  'unset',
]

export const outline: Rule[] = [
  [
    new RegExp(`^outline-(${outlineStyle.join('|')})$`), ([, d]) => {

      return {
        'outline-style': d,
      }
    },
  ],
  [
    /^outline-width-(.+)$/, ([, d]) => {
      const size = h.bracket.fraction.rem(d)

      return {
        'outline-width': size,
      }
    },
  ],
  [
    /^outline-color-(.+)$/, colorResolver('outline-color', 'outline-color'),
  ],
  [
    new RegExp(`^outline-(${outlineStyle.join('|')})-(.+)$`), (reg, config) => {
      const style = outlineStyle.find(item => reg.includes(item))
      // colorResolver need arguments[1] match
      reg[1] = reg[2]
      const color = colorResolver('outline-color', 'outline-color')(reg, config)
      if (!color)
        return

      return {
        outline: `2px ${style}`,
        ...color,
      }
    },
  ],
]

const listStyleProps = [
  'none', 'disc', 'circle', 'square',
  'decimal', 'zero-decimal', 'greek', 'roman',
  'upper-roman', 'alpha', 'upper-alpha',
]

export const listStyle: Rule[] = [
  [new RegExp(`^list-((${listStyleProps.join('|')})(?:(-outside|-inside))?)$`), ([, value]) => {
    const style = value.split(/-outside|-inside/)[0]
    const position = /inside|outside/.exec(value) ?? []

    if (position.length) {
      return {
        'list-style-position': `${position[0]}`,
        'list-style-type': `${style}`,
      }
    }
    return {
      'list-style-type': `${style}`,
    }
  }],
  [/^list-(inside|outside)$/, ([, value]) => {
    return {
      'list-style-position': value,
    }
  }],
]

export const boxDecorationBreaks: Rule[] = [
  ['decoration-slice', { 'box-decoration-break': 'slice' }],
  ['decoration-clone', { 'box-decoration-break': 'clone' }],
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

export const appearance: Rule[] = [
  ['appearance-none', {
    'appearance-none': 'none',
  }],
]
