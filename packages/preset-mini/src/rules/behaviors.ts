import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '../utils'

export const outline: Rule[] = [
  // size
  [/^outline-(?:width-|size-)?(.+)$/, ([, d]) => ({ 'outline-width': h.bracket.fraction.auto.rem(d) })],

  // color
  [/^outline-(?:color-)?(.+)$/, colorResolver('outline-color', 'outline-color')],

  // offset
  [/^outline-offset-(.+)$/, ([, d]) => ({ 'outline-offset': h.bracket.fraction.auto.rem(d) })],

  // style
  ['outline', { 'outline-style': 'solid' }],
  [/^outline-(auto|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit|initial|revert|unset)$/, ([, c]) => ({ 'outline-style': c })],
  ['outline-none', { 'outline': '2px solid transparent', 'outline-offset': '2px' }],
]

export const appearance: Rule[] = [
  ['appearance-none', {
    'appearance': 'none',
    '-webkit-appearance': 'none',
  }],
]

export const willChange: Rule[] = [
  [/^will-change-(.+)/, ([, p]) => ({ 'will-change': h.properties.global(p) })],
]
