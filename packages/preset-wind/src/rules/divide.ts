import type { CSSEntries, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { borderStyles, handlerBorderStyle } from '@unocss/preset-mini/rules'
import { colorResolver, directionMap, handler as h } from '@unocss/preset-mini/utils'

export const divides: Rule[] = [
  // divides
  [/^divide-?([xy])$/, handlerDivide, { autocomplete: ['divide-(x|y|block|inline)', 'divide-(x|y|block|inline)-reverse', 'divide-(x|y|block|inline)-$lineWidth'] }],
  [/^divide-?([xy])-?(-?.+)$/, handlerDivide],
  [/^divide-?([xy])-reverse$/, ([, d]) => ({ [`--un-divide-${d}-reverse`]: 1 })],
  [/^divide-(block|inline)$/, handlerDivide],
  [/^divide-(block|inline)-(-?.+)$/, handlerDivide],
  [/^divide-(block|inline)-reverse$/, ([, d]) => ({ [`--un-divide-${d}-reverse`]: 1 })],

  // color & opacity
  [/^divide-(.+)$/, colorResolver('border-color', 'divide'), { autocomplete: 'divide-$colors' }],
  [/^divide-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-divide-opacity': h.bracket.percent(opacity) }), { autocomplete: ['divide-(op|opacity)', 'divide-(op|opacity)-<percent>'] }],

  // styles
  ...borderStyles.map(style => [`divide-${style}`, { 'border-style': style }] as Rule),
]

function handlerDivide([, d, s]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const v = theme.lineWidth?.[s || 'DEFAULT'] ?? h.bracket.cssvar.px(s || '1')
  if (v != null) {
    const results = directionMap[d].map((item): [string, string] => {
      const key = `border${item}-width`
      const value = item.endsWith('right') || item.endsWith('bottom')
        ? `calc(${v} * var(--un-divide-${d}-reverse))`
        : `calc(${v} * calc(1 - var(--un-divide-${d}-reverse)))`
      return [key, value]
    })
    const borderStyle = handlerBorderStyle(['', d, 'solid'])

    if (results && borderStyle) {
      return [
        [`--un-divide-${d}-reverse`, 0],
        ...results,
        ...borderStyle,
      ]
    }
  }
}
