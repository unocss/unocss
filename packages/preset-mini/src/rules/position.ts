import { CSSEntries, Rule } from '@unocss/core'
import { directionMap, handler as h } from '../utils'

export const positions: Rule[] = [
  ['relative', { position: 'relative' }],
  ['absolute', { position: 'absolute' }],
  ['fixed', { position: 'fixed' }],
  ['sticky', { position: 'sticky' }],
  ['static', { position: 'static' }],
]

export const justifies: Rule[] = [
  ['justify-start', { 'justify-content': 'flex-start' }],
  ['justify-end', { 'justify-content': 'flex-end' }],
  ['justify-center', { 'justify-content': 'center' }],
  ['justify-between', { 'justify-content': 'space-between' }],
  ['justify-around', { 'justify-content': 'space-around' }],
  ['justify-evenly', { 'justify-content': 'space-evenly' }],
]

export const orders: Rule[] = [
  [/^order-(.+)$/, ([, v]) => ({ order: { first: '-9999', last: '9999', none: '0' }[v] || h.bracket.number(v) })],
]

const basicSet = ['auto', 'start', 'end', 'center', 'stretch']

export const justifyItems: Rule[] = basicSet
  .map(i => [`justify-items-${i}`, { 'justify-items': i }])

export const justifySelfs: Rule[] = basicSet
  .map(i => [`justify-self-${i}`, { 'justify-self': i }])

export const alignContents: Rule[] = [
  ['content-start', { 'align-content': 'flex-start' }],
  ['content-end', { 'align-content': 'flex-end' }],
  ['content-center', { 'align-content': 'center' }],
  ['content-between', { 'align-content': 'space-between' }],
  ['content-around', { 'align-content': 'space-around' }],
  ['content-evenly', { 'align-content': 'space-evenly' }],
]

export const alignItems: Rule[] = [
  ['items-start', { 'align-items': 'flex-start' }],
  ['items-end', { 'align-items': 'flex-end' }],
  ['items-center', { 'align-items': 'center' }],
  ['items-baseline', { 'align-items': 'baseline' }],
  ['items-stretch', { 'align-items': 'stretch' }],
]

export const alignSelfs: Rule[] = [
  ['self-auto', { 'align-self': 'auto' }],
  ['self-start', { 'align-self': 'flex-start' }],
  ['self-end', { 'align-self': 'flex-end' }],
  ['self-center', { 'align-self': 'center' }],
  ['self-stretch', { 'align-items': 'stretch' }],
]

export const placeContents: Rule[] = [
  ['place-content-start', { 'place-content': 'start' }],
  ['place-content-end', { 'place-content': 'end' }],
  ['place-content-center', { 'place-content': 'center' }],
  ['place-content-between', { 'place-content': 'space-between' }],
  ['place-content-around', { 'place-content': 'space-around' }],
  ['place-content-evenly', { 'place-content': 'space-evenly' }],
  ['place-content-stretch', { 'place-content': 'stretch' }],
]

export const placeItems: Rule[] = basicSet
  .map(i => [`place-items-${i}`, { 'place-items': i }])

export const placeSelfs: Rule[] = basicSet
  .map(i => [`place-self-${i}`, { 'place-self': i }])

function handleInsetValue(v: string): string | number | undefined {
  return { auto: 'auto', full: '100%' }[v] ?? h.bracket.fraction.cssvar.rem(v)
}

export const insets: Rule[] = [
  [/^(top|left|right|bottom|inset)-(.+)$/, ([, d, v]) => ({ [d]: handleInsetValue(v) })],
  [/^inset-([xy])-(.+)$/, ([, d, v]): CSSEntries | undefined => {
    const r = handleInsetValue(v)
    if (r != null && d in directionMap)
      return directionMap[d].map(i => [i.slice(1), r])
  }],
]

export const floats: Rule[] = [
  [/^float-(left|right|none)$/, ([, value]) => ({ float: value })],
  [/^clear-(left|right|both|none)$/, ([, value]) => ({ clear: value })],
]

export const zIndexes: Rule[] = [
  ['z-auto', { 'z-index': 'auto' }],
  [/^z-([^-]+)$/, ([, v]) => ({ 'z-index': h.number(v) })],
]

export const boxSizing: Rule[] = [
  [
    /^box-(border|content)$/, ([, value]) => ({
      'box-sizing': `${value}-box`,
    }),
  ],
]
