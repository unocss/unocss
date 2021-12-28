import type { CSSEntry, Rule } from '@unocss/core'
import { directionSize } from '@unocss/preset-mini/utils'

export const spaces: Rule[] = [
  [/^space-?([xy])-?(-?.+)$/, (match) => {
    const [, direction, size] = match
    if (size === 'reverse')
      return { [`--un-space-${direction}-reverse`]: 1 }

    const results: CSSEntry[][] | undefined = directionSize('margin')(match)?.map((items: CSSEntry[]) => items.map((item) => {
      const value = item[0].endsWith('right') || item[0].endsWith('bottom')
        ? `calc(${item[1]} * var(--un-space-${direction}-reverse))`
        : `calc(${item[1]} * calc(1 - var(--un-space-${direction}-reverse)))`
      return [item[0], value] as CSSEntry
    }))

    if (results) {
      return results.map(entry => [
        [`--un-space-${direction}-reverse`, 0] as CSSEntry,
        ...entry,
      ])
    }
  }],
]
