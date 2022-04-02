import type { CSSEntries, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { directionMap, handler as h } from '@unocss/preset-mini/utils'

export const spaces: Rule[] = [
  [/^space-?([xy])-?(-?.+)$/, handlerSpace, { autocomplete: ['space-(x|y|block|inline)', 'space-(x|y|block|inline)-reverse', 'space-(x|y|block|inline)-$spacing'] }],
  [/^space-?([xy])-reverse$/, ([, d]) => ({ [`--un-space-${d}-reverse`]: 1 })],
  [/^space-(block|inline)-(-?.+)$/, handlerSpace],
  [/^space-(block|inline)-reverse$/, ([, d]) => ({ [`--un-space-${d}-reverse`]: 1 })],
]

function handlerSpace([, d, s]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined {
  const v = theme.spacing?.[s || 'DEFAULT'] ?? h.bracket.cssvar.auto.fraction.rem(s || '1')
  if (v != null) {
    const results = directionMap[d].map((item): [string, string] => {
      const key = `margin${item}`
      const value = item.endsWith('right') || item.endsWith('bottom')
        ? `calc(${v} * var(--un-space-${d}-reverse))`
        : `calc(${v} * calc(1 - var(--un-space-${d}-reverse)))`
      return [key, value]
    })

    if (results) {
      return [
        [`--un-space-${d}-reverse`, 0],
        ...results,
      ]
    }
  }
}
