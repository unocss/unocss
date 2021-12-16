import type { Rule } from '@unocss/core'
import { createColorAndOpacityRulePair, createColorRule, handler as h, sizeRemResolver, createGlobalKeywordRules } from '../utils'
import { cssProps } from './static'

export const outline: Rule[] = [
  // size
  [/^outline-(?:width-|size-)?(.+)$/, sizeRemResolver('outline-width')],
  [/^outline-offset-(.+)$/, sizeRemResolver('outline-offset')],

  // colors
  createColorRule('outline-color'),
  ...createColorAndOpacityRulePair('outline', 'outline-color', 'outline-color'),

  // style
  ['outline', { 'outline-style': 'solid' }],
  ...createGlobalKeywordRules('outline', 'outline-style', [
    'auto',
    'dashed',
    'dotted',
    'double',
    'groove',
    'inset',
    'outset',
    'ridge',
    'solid',
  ]),
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
  [/^placeholder-opacity-(\d+)$/, ([, d]) => ({ 'placeholder-opacity': h.bracket.percent(d) })],
  createColorRule('placeholder', 'placeholder-color'),
  createColorRule('placeholder-color'),
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
