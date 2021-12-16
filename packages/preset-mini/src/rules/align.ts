import type { Rule } from '@unocss/core'
import { createKeywordRules } from '../utils'

export const verticalAligns: Rule[] = [
  ...createKeywordRules(['vertical', 'align', 'v'], 'vertical-align', [
    'baseline',
    'bottom',
    'middle',
    'text-bottom',
    'text-top',
    'top',
    ['base', 'baseline'],
    ['btm', 'bottom'],
    ['mid', 'middle'],
  ]),
]

export const textAligns: Rule[] = [
  ...createKeywordRules('text', 'text-align', [
    'center',
    'justify',
    'left',
    'right',
  ]),
]
