import type { CSSEntries, Rule } from '@unocss/core'
import { directionMap, handler as h } from '@unocss/preset-mini/utils'

export const spaces: Rule[] = [
  [/^space-?([xy])-?(-?.+)$/, handlerSpace],
  [/^space-?([xy])-reverse$/, ([, d]) => ({ [`--un-space-${d}-reverse`]: 1 })],
  [/^space-(block|inline)-(-?.+)$/, handlerSpace],
  [/^space-(block|inline)-reverse$/, ([, d]) => ({ [`--un-space-${d}-reverse`]: 1 })],
]

function handlerSpace([, d, s = '1']: string[]): CSSEntries | undefined {
  const v = h.bracket.cssvar.auto.fraction.rem(s)
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
