import type { CSSEntries, Rule } from '@unocss/core'
import { colorResolver, directionMap, handler as h } from '@unocss/preset-mini/utils'

export const divideColors: Rule[] = [
  [/^divide-(.+)$/, colorResolver('border-color', 'divide')],
  [/^divide-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-divide-opacity': h.bracket.percent(opacity) })],
]

export const divideSizes: Rule[] = [
  [/^divide-?([xy])$/, handlerDivide],
  [/^divide-?([xy])-?(-?.+)$/, handlerDivide],
  [/^divide-?([xy])-reverse$/, ([, d]) => [[`--un-divide-${d}-reverse`, 1]]],
]

export const divideStyles: Rule[] = [
  ['divide-solid', { 'border-style': 'solid' }],
  ['divide-dashed', { 'border-style': 'dashed' }],
  ['divide-dotted', { 'border-style': 'dotted' }],
  ['divide-double', { 'border-style': 'double' }],
  ['divide-none', { 'border-style': 'none' }],
]

export const divides = [divideSizes, divideColors, divideStyles].flat(1)

function handlerDivide([, a, b]: string[]): CSSEntries | undefined {
  const [d, s = '1'] = directionMap[a] ? [a, b] : ['', a]
  const v = h.bracket.px(s)

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
