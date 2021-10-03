import { MiniwindCssEntries } from '../../..'
import { MiniwindRule } from '../../../types'
import { directionMap, h } from '../../../utils'

export const positions: MiniwindRule[] = [
  ['relative', { position: 'relative' }],
  ['absolute', { position: 'absolute' }],
  ['fixed', { position: 'fixed' }],
]

export const justifies: MiniwindRule[] = [
  ['justify-start', { 'justify-content': 'flex-start' }],
  ['justify-end', { 'justify-content': 'flex-end' }],
  ['justify-center', { 'justify-content': 'center' }],
  ['justify-between', { 'justify-content': 'space-between' }],
  ['justify-around', { 'justify-content': 'space-around' }],
  ['justify-evenly', { 'justify-content': 'space-evenly' }],
]

const basicSet = ['auto', 'start', 'end', 'center', 'stretch']

export const justifyItems: MiniwindRule[] = basicSet
  .map(i => [`justify-items-${i}`, { 'justify-items': i }])

export const justifySelfs: MiniwindRule[] = basicSet
  .map(i => [`justify-self-${i}`, { 'justify-self': i }])

export const alignContents: MiniwindRule[] = [
  ['content-start', { 'align-content': 'flex-start' }],
  ['content-end', { 'align-content': 'flex-end' }],
  ['content-center', { 'align-content': 'center' }],
  ['content-between', { 'align-content': 'space-between' }],
  ['content-around', { 'align-content': 'space-around' }],
  ['content-evenly', { 'align-content': 'space-evenly' }],
]

export const alignItems: MiniwindRule[] = [
  ['items-start', { 'align-items': 'flex-start' }],
  ['items-end', { 'align-items': 'flex-end' }],
  ['items-center', { 'align-items': 'center' }],
  ['items-baseline', { 'align-items': 'baseline' }],
  ['items-stretch', { 'align-items': 'stretch' }],
]

export const alignSelfs: MiniwindRule[] = [
  ['self-auto', { 'align-self': 'auto' }],
  ['self-start', { 'align-self': 'flex-start' }],
  ['self-end', { 'align-self': 'flex-end' }],
  ['self-center', { 'align-self': 'center' }],
  ['self-stretch', { 'align-items': 'stretch' }],
]

export const placeContents: MiniwindRule[] = [
  ['place-content-start', { 'place-content': 'start' }],
  ['place-content-end', { 'place-content': 'end' }],
  ['place-content-center', { 'place-content': 'center' }],
  ['place-content-between', { 'place-content': 'space-between' }],
  ['place-content-around', { 'place-content': 'space-around' }],
  ['place-content-evenly', { 'place-content': 'space-evenly' }],
  ['place-content-stretch', { 'place-content': 'stretch' }],
]

export const placeItems: MiniwindRule[] = basicSet
  .map(i => [`place-items-${i}`, { 'place-items': i }])

export const placeSelfs: MiniwindRule[] = basicSet
  .map(i => [`place-self-${i}`, { 'place-self': i }])

function handleInsetValue(v: string): string | number | undefined {
  return { auto: 'auto', full: '100%' }[v] || h.bracket.fraction.number(v)
}

export const insets: MiniwindRule[] = [
  [/^inset-(x|y)-(.+)$/i, ([, d, v]): MiniwindCssEntries | undefined => {
    const r = handleInsetValue(v)
    if (r != null)
      return directionMap[d].map(i => [i.slice(1), r])
  }],
  [/^(top|left|right|bottom|inset)-(.+)$/i, ([, d, v]) => ({ [d]: handleInsetValue(v) })],
]

export const floats: MiniwindRule[] = [
  [/^float-(left|right|none)$/, ([, value]) => ({ float: value })],
  [/^clear-(left|right|both|none)$/, ([, value]) => ({ clear: value })],
]

export const zIndexes: MiniwindRule[] = [
  ['z-auto', { 'z-index': 'auto' }],
  [/^z-([^-]+)$/, ([, v]) => ({ 'z-index': h.number(v) })],
]
