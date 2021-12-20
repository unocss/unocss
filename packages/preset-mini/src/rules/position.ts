import type { CSSEntries, Rule } from '@unocss/core'
import { directionMap, handler as h } from '../utils'

const basicSet = ['auto', 'start', 'end', 'center', 'stretch']

export const positions: Rule[] = [
  ['relative', { position: 'relative' }],
  ['absolute', { position: 'absolute' }],
  ['fixed', { position: 'fixed' }],
  ['sticky', { position: 'sticky' }],
  ['static', { position: 'static' }],
]

export const justifies: Rule[] = [
  // contents
  ['justify-start', { 'justify-content': 'flex-start' }],
  ['justify-end', { 'justify-content': 'flex-end' }],
  ['justify-center', { 'justify-content': 'center' }],
  ['justify-between', { 'justify-content': 'space-between' }],
  ['justify-around', { 'justify-content': 'space-around' }],
  ['justify-evenly', { 'justify-content': 'space-evenly' }],

  // items, selfs
  ...basicSet.map((i): Rule => [`justify-items-${i}`, { 'justify-items': i }]),
  ...basicSet.map((i): Rule => [`justify-self-${i}`, { 'justify-self': i }]),
]

export const orders: Rule[] = [
  [/^order-(.+)$/, ([, v]) => ({ order: h.bracket.number(v) })],
  ['order-first', { order: '-9999' }],
  ['order-last', { order: '9999' }],
  ['order-none', { order: '0' }],
]

export const alignments: Rule[] = [
  // contents
  ['content-start', { 'align-content': 'flex-start' }],
  ['content-end', { 'align-content': 'flex-end' }],
  ['content-center', { 'align-content': 'center' }],
  ['content-between', { 'align-content': 'space-between' }],
  ['content-around', { 'align-content': 'space-around' }],
  ['content-evenly', { 'align-content': 'space-evenly' }],

  // items
  ['items-start', { 'align-items': 'flex-start' }],
  ['items-end', { 'align-items': 'flex-end' }],
  ['items-center', { 'align-items': 'center' }],
  ['items-baseline', { 'align-items': 'baseline' }],
  ['items-stretch', { 'align-items': 'stretch' }],

  // selfs
  ['self-auto', { 'align-self': 'auto' }],
  ['self-start', { 'align-self': 'flex-start' }],
  ['self-end', { 'align-self': 'flex-end' }],
  ['self-center', { 'align-self': 'center' }],
  ['self-stretch', { 'align-self': 'stretch' }],
]

export const placements: Rule[] = [
  // contents
  ['place-content-start', { 'place-content': 'start' }],
  ['place-content-end', { 'place-content': 'end' }],
  ['place-content-center', { 'place-content': 'center' }],
  ['place-content-between', { 'place-content': 'space-between' }],
  ['place-content-around', { 'place-content': 'space-around' }],
  ['place-content-evenly', { 'place-content': 'space-evenly' }],
  ['place-content-stretch', { 'place-content': 'stretch' }],

  // items, selfs
  ...basicSet.map((i): Rule => [`place-items-${i}`, { 'place-items': i }]),
  ...basicSet.map((i): Rule => [`place-self-${i}`, { 'place-self': i }]),
]

function handleInsetValue(v: string): string | number | undefined {
  return { auto: 'auto', full: '100%' }[v] ?? h.bracket.fraction.cssvar.auto.rem(v)
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
  // floats
  ['float-left', { float: 'left' }],
  ['float-right', { float: 'right' }],
  ['float-none', { float: 'none' }],

  // clears
  ['clear-left', { clear: 'left' }],
  ['clear-right', { clear: 'right' }],
  ['clear-both', { clear: 'both' }],
  ['clear-none', { clear: 'none' }],
]

export const zIndexes: Rule[] = [
  ['z-auto', { 'z-index': 'auto' }],
  [/^z-([^-]+)$/, ([, v]) => ({ 'z-index': h.number(v) })],
]

export const boxSizing: Rule[] = [
  ['box-border', { 'box-sizing': 'border-box' }],
  ['box-content', { 'box-sizing': 'content-box' }],
]
