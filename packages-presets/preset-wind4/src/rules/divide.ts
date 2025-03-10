import type { CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, defineProperty, h } from '../utils'
import { borderStyles } from './border'
import { notLastChildSelector } from './spacing'

export const divides: Rule<Theme>[] = [
// color & opacity
  [/^divide-(.+)$/, function* (match, ctx) {
    const result = colorResolver('border-color', 'divide')(match, ctx)
    if (result) {
      yield {
        [ctx.symbols.selector]: notLastChildSelector,
        ...result[0] as CSSObject,
      }
      yield result[1]
    }
  }, { autocomplete: 'divide-$colors' }],
  [/^divide-op(?:acity)?-?(.+)$/, function* ([, opacity], { symbols }) {
    yield {
      [symbols.selector]: notLastChildSelector,
      '--un-divide-opacity': h.bracket.percent(opacity),
    }
  }, { autocomplete: ['divide-(op|opacity)', 'divide-(op|opacity)-<percent>'] }],

  // divides
  [/^divide-?([xy])$/, handlerDivide, { autocomplete: ['divide-(x|y)', 'divide-(x|y)-reverse'] }],
  [/^divide-?([xy])-?(.+)$/, handlerDivide],
  [/^divide-?([xy])-reverse$/, function* ([, d]: string[], { symbols }: RuleContext<Theme>) {
    yield {
      [symbols.selector]: notLastChildSelector,
      [`--un-divide-${d}-reverse`]: '1',
    }
    yield defineProperty(`--un-divide-${d}-reverse`, { initialValue: 0 })
  }],

  // styles
  [new RegExp(`^divide-(${borderStyles.join('|')})$`), function* ([, style]: string[], { symbols }: RuleContext<Theme>) {
    yield {
      [symbols.selector]: notLastChildSelector,
      'border-style': style,
    }
  }, { autocomplete: borderStyles.map(i => `divide-${i}`) }],
]

function* handlerDivide([, d, s]: string[], { symbols }: RuleContext<Theme>) {
  let v = h.bracket.cssvar.px(s || '1')
  if (v != null) {
    if (v === '0')
      v = '0px'

    const directionMap: Record<string, string[]> = {
      x: ['-left', '-right'],
      y: ['-top', '-bottom'],
    }
    const results = directionMap[d].map((item): [string, string][] => {
      const value = (item.endsWith('left') || item.endsWith('top'))
        ? `calc(${v} * var(--un-divide-${d}-reverse))`
        : `calc(${v} * calc(1 - var(--un-divide-${d}-reverse)))`
      return [
        [`border${item}-width`, value],
        [`border${item}-style`, `var(--un-border-style)`],
      ]
    })

    if (results) {
      yield {
        [symbols.selector]: notLastChildSelector,
        [`--un-divide-${d}-reverse`]: 0,
        ...Object.fromEntries(results.flat()),
      }
      yield defineProperty(`--un-divide-${d}-reverse`, { initialValue: 0 })
      yield defineProperty(`--un-border-style`, { initialValue: 'solid' })
    }
  }
}
