import type { Rule } from '@unocss/core'
import { globalKeywords } from '../_utils/mappings'
import { h } from '../_utils/handlers'

const verticalAlignAlias: Record<string, string> = {
  'mid': 'middle',
  'base': 'baseline',
  'btm': 'bottom',
  'baseline': 'baseline',
  'top': 'top',
  'start': 'top',
  'middle': 'middle',
  'bottom': 'bottom',
  'end': 'bottom',
  'text-top': 'text-top',
  'text-bottom': 'text-bottom',
  'sub': 'sub',
  'super': 'super',
  ...Object.fromEntries(globalKeywords.map(x => [x, x])),
}

export const verticalAligns: Rule[] = [
  [
    /^(?:vertical|align|v)-([-\w]+%?)$/,
    ([, v]) => ({ 'vertical-align': verticalAlignAlias[v] ?? h.numberWithUnit(v) }),
    {
      autocomplete: [
      `(vertical|align|v)-(${Object.keys(verticalAlignAlias).join('|')})`,
      '(vertical|align|v)-<percentage>',
      ],
    },
  ],
]

const textAlignValues = ['center', 'left', 'right', 'justify', 'start', 'end']

export const textAligns: Rule[] = [
  ...textAlignValues
    .map(v => [`text-${v}`, { 'text-align': v }] as Rule),
  ...[
    ...globalKeywords,
    ...textAlignValues,
  ].map(v => [`text-align-${v}`, { 'text-align': v }] as Rule),
]
