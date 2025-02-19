import type { CSSEntries, Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, directionMap, h } from '../utils'
import { borderStyles } from './border'

// TODO: divide variant effect

export const divides: Rule<Theme>[] = [
  // divides
  [/^divide-?([xy])$/, handlerDivide, { autocomplete: ['divide-(x|y|block|inline)', 'divide-(x|y|block|inline)-reverse'] }],
  [/^divide-?([xy])-?(.+)$/, handlerDivide],
  [/^divide-?([xy])-reverse$/, ([, d]) => ({ [`--un-divide-${d}-reverse`]: 1 })],
  [/^divide-(block|inline)$/, handlerDivide],
  [/^divide-(block|inline)-(.+)$/, handlerDivide],
  [/^divide-(block|inline)-reverse$/, ([, d]) => ({ [`--un-divide-${d}-reverse`]: 1 })],

  // color & opacity
  [/^divide-(.+)$/, colorResolver('border-color', 'divide'), { autocomplete: 'divide-$colors' }],
  [/^divide-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-divide-opacity': h.bracket.percent(opacity) }), { autocomplete: ['divide-(op|opacity)', 'divide-(op|opacity)-<percent>'] }],

  // styles
  ...borderStyles.map(style => [`divide-${style}`, { 'border-style': style }] as Rule<Theme>),
]

function handlerDivide([, d, s]: string[]): CSSEntries | undefined {
  let v = h.bracket.cssvar.px(s || '1')
  if (v != null) {
    if (v === '0')
      v = '0px'

    const results = directionMap[d].map((item): [string, string] => {
      const key = `border${item}-width`
      const value = (item.endsWith('right') || item.endsWith('bottom'))
        ? `calc(${v} * var(--un-divide-${d}-reverse))`
        : `calc(${v} * calc(1 - var(--un-divide-${d}-reverse)))`
      return [key, value]
    })

    if (results) {
      return [
        [`--un-divide-${d}-reverse`, 0],
        ...results,
      ]
    }
  }
}
