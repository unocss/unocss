import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

export const gaps: Rule[] = [
  [/^(?:flex-|grid-)?gap-(x-|y-)?([^-]+)$/, ([, d = '', s]) => {
    const v = h.bracket.auto.rem(s)
    if (v != null) {
      const direction = {
        '': '',
        'x-': 'column-',
        'y-': 'row-',
      }[d]

      return {
        [`grid-${direction}gap`]: v,
        [`${direction}gap`]: v,
      }
    }
  }],
]
