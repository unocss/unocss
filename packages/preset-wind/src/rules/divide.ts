import type { CSSEntries, Rule } from '@unocss/core'
import { colorResolver, directionMap, handler as h } from '@unocss/preset-mini/utils'

export const divides: Rule[] = [
  // divides
  [/^divide-?([xy])$/, handlerDivide],
  [/^divide-?([xy])-?(-?.+)$/, handlerDivide],
  [/^divide-?([xy])-reverse$/, ([, d]) => ({ [`--un-divide-${d}-reverse`]: 1 })],
  [/^divide-(block|inline)$/, handlerDivide],
  [/^divide-(block|inline)-(-?.+)$/, handlerDivide],
  [/^divide-(block|inline)-reverse$/, ([, d]) => ({ [`--un-divide-${d}-reverse`]: 1 })],

  // color & opacity
  [/^divide-(.+)$/, colorResolver('border-color', 'divide')],
  [/^divide-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-divide-opacity': h.bracket.percent(opacity) })],

  // styles
  ['divide-solid', { 'border-style': 'solid' }],
  ['divide-dashed', { 'border-style': 'dashed' }],
  ['divide-dotted', { 'border-style': 'dotted' }],
  ['divide-double', { 'border-style': 'double' }],
  ['divide-none', { 'border-style': 'none' }],
]

function handlerDivide([, d, s = '1']: string[]): CSSEntries | undefined {
  const v = h.bracket.cssvar.px(s)
  if (v != null) {
    const results = directionMap[d].map((item): [string, string] => {
      const key = `border${item}-width`
      const value = item.endsWith('right') || item.endsWith('bottom')
        ? `calc(${v} * var(--un-divide-${d}-reverse))`
        : `calc(${v} * calc(1 - var(--un-divide-${d}-reverse)))`
      return [key, value]
    })

    if (results)
      return [[`--un-divide-${d}-reverse`, 0], ...results]
  }
}
