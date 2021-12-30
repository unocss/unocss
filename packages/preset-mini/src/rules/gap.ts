import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const directions: Record<string, string> = {
  '': '',
  'x-': 'column-',
  'y-': 'row-',
}

export const gaps: Rule[] = [
  [/^(?:flex-|grid-)?gap-(x-|y-)?([^-]+)$/, ([, d = '', s]) => {
    const v = h.bracket.auto.rem(s)
    if (v != null) {
      return {
        [`grid-${directions[d]}gap`]: v,
        [`${directions[d]}gap`]: v,
      }
    }
  }],
]
