import type { CSSEntries, CSSPropertyValue, Rule } from '@unocss/core'
import { createKeywordRules, directionMap, handler as h } from '../utils'

const contentSet: CSSPropertyValue[] = [
  'center',
  ['around', 'space-around'],
  ['between', 'space-between'],
  ['end', 'flex-end'],
  ['evenly', 'space-evenly'],
  ['start', 'flex-start'],
]

const basicSet = [
  'auto',
  'center',
  'end',
  'start',
  'stretch',
]

export const positions: Rule[] = [
  ['relative', { position: 'relative' }],
  ['absolute', { position: 'absolute' }],
  ['fixed', { position: 'fixed' }],
  ['sticky', { position: 'sticky' }],
  ['static', { position: 'static' }],
]

export const justifies: Rule[] = [
  ...createKeywordRules('justify', 'justify-content', contentSet),
  ...createKeywordRules('justify-items', 'justify-items', basicSet),
  ...createKeywordRules('justify-self', 'justify-self', basicSet),
]

export const orders: Rule[] = [
  [/^order-(.+)$/, ([, v]) => ({ order: { first: '-9999', last: '9999' }[v] || h.bracket.number(v) })],
  ['order-none', { order: '0' }],
]

export const alignments: Rule[] = [
  // contents
  ...createKeywordRules('content', 'align-content', contentSet),

  // items
  ...createKeywordRules('items', 'align-items', [
    'baseline',
    'center',
    'stretch',
    ['end', 'flex-end'],
    ['start', 'flex-start'],
  ]),

  // selfs
  ...createKeywordRules('self', 'align-self', [
    'auto',
    'center',
    'stretch',
    ['end', 'flex-end'],
    ['start', 'flex-start'],
  ]),
]

export const placements: Rule[] = [
  ...createKeywordRules('place-content', 'place-content', [
    'center',
    'end',
    'start',
    'stretch',
    ['around', 'space-around'],
    ['between', 'space-between'],
    ['evenly', 'space-evenly'],
  ]),
  ...createKeywordRules('place-items', 'place-items', basicSet),
  ...createKeywordRules('place-self', 'place-self', basicSet),
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
  ...createKeywordRules('float', 'float', [
    'left',
    'right',
  ]),
  ['float-none', { float: 'none' }],
  ...createKeywordRules('clear', 'clear', [
    'left',
    'right',
    'both',
  ]),
  ['clear-none', { clear: 'none' }],
]

export const zIndexes: Rule[] = [
  ['z-auto', { 'z-index': 'auto' }],
  [/^z-([^-]+)$/, ([, v]) => ({ 'z-index': h.number(v) })],
]

export const boxSizing: Rule[] = [
  ...createKeywordRules('box', 'box-sizing', [
    ['border', 'border-box'],
    ['content', 'content-box'],
  ]),
]
