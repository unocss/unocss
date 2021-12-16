import type { Rule } from '@unocss/core'
import { createKeywordRules, handler as h } from '@unocss/preset-mini/utils'

export const columns: Rule[] = [
  [/^columns-(.+)$/, ([, v]) => {
    const column = h.bracket.global.number.numberWithUnit.auto(v)
    if (column)
      return { column }
  }],
  // TODO: support for non-variable spaced-values
  // https://developer.mozilla.org/en-US/docs/Web/CSS/columns#syntax

  ...createKeywordRules('break-before', 'break-before', [
    'all',
    'auto',
    'avoid',
    'avoid-page',
    'column',
    'left',
    'page',
    'right',
  ]),

  ...createKeywordRules('break-inside', 'break-inside', [
    'auto',
    'avoid',
    'avoid-column',
    'avoid-page',
  ]),

  ...createKeywordRules('break-after', 'break-after', [
    'all',
    'auto',
    'avoid',
    'avoid-page',
    'column',
    'left',
    'page',
    'right',
  ]),
]
