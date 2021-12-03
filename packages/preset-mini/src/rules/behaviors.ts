import { Rule } from '@unocss/core'
import { handler as h } from '../utils'
import { colorResolver } from './color'

const outlineStyle = ['none', 'auto', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'revert', 'unset']

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
  ['outline-none', { 'outline': '2px solid transparent', 'outline-offset': '2px' }],
  ['outline', { 'outline-style': 'solid' }],
  [
    /^outline-(.+)$/, (match, config) => {
      const [, d] = match

      if (d === 'none') {
        return {
          'outline': '2px solid transparent',
          'outline-offset': '2px',
        }
      }

      if (outlineStyle.includes(d)) {
        return {
          'outline-style': d,
        }
      }

      const sizeSheet = parseOutlineSize(d)
      if (sizeSheet)
        return sizeSheet

      const colorSheet = colorResolver('outline-color', 'outline-color')([
        match[0],
        match[1].replace(/^color-/, ''),
      ], config)
      if (colorSheet)
        return colorSheet
    },
  ],
]

export const appearance: Rule[] = [
  ['appearance-none', {
    'appearance': 'none',
    '-webkit-appearance': 'none',
  }],
]

export const placeholder: Rule[] = [
  [
    /^placeholder-opacity-(\d+)$/,
    ([, d]) => ({
      'placeholder-opacity': h.bracket.percent(d),
    }),
  ],
  [
    /^placeholder-(?!opacity)(.+)$/,
    (match, config) => {
      match[1] = match[1].replace(/^color-/, '')
      return colorResolver('placeholder-color', 'placeholder-color')(match, config)
    },
  ],
]
