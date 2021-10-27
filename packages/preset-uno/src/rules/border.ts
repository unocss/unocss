import { Theme, CSSEntries, Rule } from '@unocss/core'
import { cornerMap, directionMap, handler as h } from '../utils'

export const borders: Rule[] = [
  [/^border$/, handlerBorder],
  [/^border(?:-([^-]+))?$/, handlerBorder],
  [/^border(?:-([^-]+))?(?:-([^-]+))?$/, handlerBorder],
]

export const borderRadius: Rule[] = [
  [/^(?:border-)?(?:rounded|rd)$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)(?:-([^-]+))?$/, handlerRounded],
  [/^(?:border-)?(?:rounded|rd)(?:-([^-]+))?(?:-([^-]+))?$/, handlerRounded],
]

export const borderStyles: Rule[] = [
  ['border-solid', { 'border-style': 'solid' }],
  ['border-dashed', { 'border-style': 'dashed' }],
  ['border-dotted', { 'border-style': 'dotted' }],
  ['border-double', { 'border-style': 'double' }],
  ['border-none', { 'border-style': 'none' }],
]

function handlerBorder([, a, b]: string[]): CSSEntries | undefined {
  const [d, s = '1'] = directionMap[a] ? [a, b] : ['', a]
  const v = h.bracket.border(s)
  if (v != null) {
    return [
      ...directionMap[d].map((i): [string, string] => [`border${i}-width`, v]),
      ['border-style', 'solid'],
    ]
  }
}

function handlerRounded([, a, b]: string[], theme: Theme): CSSEntries | undefined {
  const [d, s = 'DEFAULT'] = cornerMap[a] ? [a, b] : ['', a]
  const v = theme.borderRadius?.[s] || h.bracket.fraction.size(s)
  if (v != null)
    return cornerMap[d].map(i => [`border${i}-radius`, v])
}
