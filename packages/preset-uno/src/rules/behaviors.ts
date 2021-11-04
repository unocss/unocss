import { Rule } from '@unocss/core'
import { handler as h } from '../utils'
import { colorResolver } from './color'

const outlineStyle = [
  'none', // deal by /^outline-([a-z]+)$/
  'auto',
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

const parseOutlineSize = (s: string) => {
  const propName = ['width', 'offset'].find(item => s.startsWith(item)) || 'width'
  const size = h.bracket.fraction.rem((s.replace(/^(offset\-|width\-)/, '')))
  if (size) {
    return {
      [`outline-${propName}`]: size,
    }
  }
}

export const outline: Rule[] = [
  ['outline', { 'outline-style': 'solid' }],
  [
    /^outline-(.+)$/, (match, config) => {
      const [, d] = match

      const handlerList = [
        () => {
          if (d === 'none') {
            return {
              'outline': '2px solid transparent',
              'outline-offset': '2px',
            }
          }
        },

        () => {
          const matchedStyle = outlineStyle.find(item => item === d)
          if (matchedStyle) {
            return {
              'outline-style': matchedStyle,
            }
          }
        },

        () => {
          const sizeSheet = parseOutlineSize(d)
          if (sizeSheet)
            return sizeSheet
        },

        () => {
          if (match[1].startsWith('color-'))
            match[1] = match[1].replace('color-', '')

          const colorSheet = colorResolver('outline-color', 'outline-color')(match, config)
          if (colorSheet)
            return colorSheet
        },
      ]

      for (const h of handlerList) {
        const res = h()
        if (res)
          return res
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
