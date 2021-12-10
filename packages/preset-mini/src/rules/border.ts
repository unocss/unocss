import { CSSEntries, RuleContext, Rule } from '@unocss/core'
import { Theme } from '../theme'
import { cornerMap, directionMap, handler as h } from '../utils'
import { colorResolver } from './color'

export const borders: Rule[] = [
  // size
  [/^border$/, handlerBorder],
  [/^(?:border|b)(?:-([^-]+))?$/, handlerBorder],
  [/^(?:border|b)(?:-([^-]+))?(?:-([^-]+))?$/, handlerBorder],

  // style
  ['border-solid', { 'border-style': 'solid' }],
  ['border-dashed', { 'border-style': 'dashed' }],
  ['border-dotted', { 'border-style': 'dotted' }],
  ['border-double', { 'border-style': 'double' }],
  ['border-none', { 'border-style': 'none' }],

  // radius
  [/^(?:border-)?(?:rounded|rd)$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)(?:-([^-]+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)(?:-([^-]+))?(?:-([^-]+))?$/, handlerRounded],

  // colors
  [/^(?:border|b)-(.+)$/, colorResolver('border-color', 'border')],
  [/^(?:border|b)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-border-opacity': h.bracket.percent(opacity) })],
]

function handlerBorder([, a, b]: string[]): CSSEntries | undefined {
  const [d, s = '1'] = directionMap[a] ? [a, b] : ['', a]
  const v = h.bracket.px(s)
  if (v != null) {
    return [
      ...directionMap[d].map((i): [string, string] => [`border${i}-width`, v]),
      ['border-style', 'solid'],
    ]
  }
}

function handlerRounded([, a, b]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const [d, s = 'DEFAULT'] = cornerMap[a] ? [a, b] : ['', a]
  const v = theme.borderRadius?.[s] || h.bracket.fraction.rem(s)
  if (v != null)
    return cornerMap[d].map(i => [`border${i}-radius`, v])
}
