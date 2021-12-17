import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '../utils'
import { cssProps } from './static'

const outlineStyle = ['auto', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'revert', 'unset']

const parseOutlineSize = (s: string) => {
  const propName = ['width', 'offset'].find(item => s.startsWith(item)) || 'width'
  const size = h.bracket.fraction.auto.rem((s.replace(/^(offset\-|width\-|size\-)/, '')))
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

      if (outlineStyle.includes(d)) {
        return {
          'outline-style': d,
        }
      }

      const colorSheet = colorResolver('outline-color', 'outline-color')([
        match[0],
        match[1].replace(/^color-/, ''),
      ], config)
      if (colorSheet)
        return colorSheet

      const sizeSheet = parseOutlineSize(d)
      if (sizeSheet)
        return sizeSheet
    },
  ],
  ['outline-none', { 'outline': '2px solid transparent', 'outline-offset': '2px' }],
]

export const appearance: Rule[] = [
  ['appearance-none', {
    'appearance': 'none',
    '-webkit-appearance': 'none',
  }],
]

// TODO: convert to pseudo-element
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

const cssPropsStr = cssProps.join(', ')

const validateProperty = (prop: string): string | undefined => {
  if (prop && !cssProps.includes(prop))
    return

  return prop || cssPropsStr
}

export const willChange: Rule[] = [
  [/^will-change-(.*)/, ([, p]) => {
    const w = validateProperty(p) || h.global(p)
    if (w)
      return { 'will-change': w }
  }],
]
