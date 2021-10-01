import { cornerMap, directionMap, NanowindTheme } from '../..'
import { h } from '../../handlers'
import { NanowindCssEntries, NanowindRule } from '../../types'

export const borders: NanowindRule[] = [
  [/^border$/, handlerBorder],
  [/^border(?:-([^-]+))?$/, handlerBorder],
  [/^border(?:-([^-]+))?(?:-([^-]+))?$/, handlerBorder],
]

export const rounded: NanowindRule[] = [
  [/^rounded$/, handlerRounded],
  [/^rounded(?:-([^-]+))?$/, handlerRounded],
  [/^rounded(?:-([^-]+))?(?:-([^-]+))?$/, handlerRounded],
]

export const borderStyles: NanowindRule[] = [
  ['border-solid', { 'border-style': 'solid' }],
  ['border-dashed', { 'border-style': 'dashed' }],
  ['border-dotted', { 'border-style': 'dotted' }],
  ['border-double', { 'border-style': 'double' }],
  ['border-none', { 'border-style': 'none' }],
]

function handlerBorder([, a, b]: string[]): NanowindCssEntries | undefined {
  const [d, s = '1'] = directionMap[a] ? [a, b] : ['', a]
  const v = h.bracket.border(s)
  if (v != null)
    return directionMap[d].map(i => [`border${i}-width`, v])
}

function handlerRounded([, a, b]: string[], theme: NanowindTheme): NanowindCssEntries | undefined {
  const [d, s = 'DEFAULT'] = cornerMap[a] ? [a, b] : ['', a]
  const v = theme.borderRadius[s] || h.bracket.fraction.size(s)
  if (v != null)
    return cornerMap[d].map(i => [`border${i}-radius`, v])
}
