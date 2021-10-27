import { Rule } from '@unocss/core'
import { handler as h } from '../utils'

export const gaps: Rule[] = [
  [/^(?:flex-|grid-)?gap-([^-]+)$/, ([, s]) => {
    const v = h.bracket.size(s)
    if (v != null) {
      return {
        'grid-gap': v,
        'gap': v,
      }
    }
  }],
  [/^(?:flex-|grid-)?gap-x-([^-]+)$/, ([, s]) => {
    const v = h.bracket.size(s)
    if (v != null) {
      return {
        'grid-column-gap': v,
        'column-gap': v,
      }
    }
  }],
  [/^(?:flex-|grid-)?gap-y-([^-]+)$/, ([, s]) => {
    const v = h.bracket.size(s)
    if (v != null) {
      return {
        'grid-row-gap': v,
        'row-gap': v,
      }
    }
  }],
]
