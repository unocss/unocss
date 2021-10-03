import { cornerMap, directionMap, MiniwindTheme } from '../../..'
import { h } from '../../../utils'
import { MiniwindCssEntries, MiniwindRule } from '../../../types'

export const borders: MiniwindRule[] = [
  [/^border$/, handlerBorder],
  [/^border(?:-([^-]+))?$/, handlerBorder],
  [/^border(?:-([^-]+))?(?:-([^-]+))?$/, handlerBorder],
]

export const borderRadius: MiniwindRule[] = [
  [/^(?:border-)?rounded$/, handlerRounded],
  [/^(?:border-)?rounded(?:-([^-]+))?$/, handlerRounded],
  [/^(?:border-)?rounded(?:-([^-]+))?(?:-([^-]+))?$/, handlerRounded],
]

export const borderStyles: MiniwindRule[] = [
  ['border-solid', { 'border-style': 'solid' }],
  ['border-dashed', { 'border-style': 'dashed' }],
  ['border-dotted', { 'border-style': 'dotted' }],
  ['border-double', { 'border-style': 'double' }],
  ['border-none', { 'border-style': 'none' }],
]

function handlerBorder([, a, b]: string[]): MiniwindCssEntries | undefined {
  const [d, s = '1'] = directionMap[a] ? [a, b] : ['', a]
  const v = h.bracket.border(s)
  if (v != null) {
    return [
      ...directionMap[d].map((i): [string, string] => [`border${i}-width`, v]),
      ['border-style', 'solid'],
    ]
  }
}

function handlerRounded([, a, b]: string[], theme: MiniwindTheme): MiniwindCssEntries | undefined {
  const [d, s = 'DEFAULT'] = cornerMap[a] ? [a, b] : ['', a]
  const v = theme.borderRadius[s] || h.bracket.fraction.size(s)
  if (v != null)
    return cornerMap[d].map(i => [`border${i}-radius`, v])
}
