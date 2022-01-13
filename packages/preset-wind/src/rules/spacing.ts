import type { CSSEntries, Rule } from '@unocss/core'
import { directionSize } from '@unocss/preset-mini/utils'

export const spaces: Rule[] = [
  [/^space-?([xy])-?(-?.+)$/, handlerSpace],
  [/^space-?([xy])-reverse$/, ([, d]) => ({ [`--un-space-${d}-reverse`]: 1 })],
  [/^space-(block|inline)-(-?.+)$/, handlerSpace],
  [/^space-(block|inline)-reverse$/, ([, d]) => ({ [`--un-space-${d}-reverse`]: 1 })],
]

function handlerSpace(match: string[]): CSSEntries | undefined {
  const [, direction] = match

  const results = directionSize('margin')(match)?.map((item) => {
    const value = item[0].endsWith('right') || item[0].endsWith('bottom')
      ? `calc(${item[1]} * var(--un-space-${direction}-reverse))`
      : `calc(${item[1]} * calc(1 - var(--un-space-${direction}-reverse)))`
    return [item[0], value] as typeof item
  })

  if (results) {
    return [
      [`--un-space-${direction}-reverse`, 0],
      ...results,
    ]
  }
}
