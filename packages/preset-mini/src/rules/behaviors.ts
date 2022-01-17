import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '../utils'

export const outline: Rule[] = [
  // size
  [/^outline-(?:width-|size-)?(.+)$/, ([, d]) => ({ 'outline-width': h.bracket.cssvar.fraction.rem(d) })],

  // color
  [/^outline-(?:color-)?(.+)$/, colorResolver('outline-color', 'outline-color')],

  // offset
  [/^outline-offset-(.+)$/, ([, d]) => ({ 'outline-offset': h.bracket.cssvar.fraction.rem(d) })],

  // style
  ['outline', { 'outline-style': 'solid' }],
  [/^outline-(auto|dashed|dotted|double|hidden|solid|groove|ridge|inset|outset|inherit|initial|revert|unset)$/, ([, c]) => ({ 'outline-style': c })],
  ['outline-none', { 'outline': '2px solid transparent', 'outline-offset': '2px' }],
]

export const appearance: Rule[] = [
  ['appearance-none', {
    'appearance': 'none',
    '-webkit-appearance': 'none',
  }],
]

const willChangeProperty = (prop: string): string | undefined => {
  return h.properties.auto.global(prop) ?? {
    contents: 'contents',
    scroll: 'scroll-position',
  }[prop]
}

export const willChange: Rule[] = [
  [/^will-change-(.+)/, ([, p]) => ({ 'will-change': willChangeProperty(p) })],
]
