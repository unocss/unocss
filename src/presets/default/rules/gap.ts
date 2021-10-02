import { NanowindRule } from '../../../types'
import { h } from '../../../handlers'

export const gaps: NanowindRule[] = [
  [/^gap-([^-]+)$/, ([, s]) => {
    const v = h.bracket.size(s)
    if (v != null) {
      return {
        'grid-gap': v,
        'gap': v,
      }
    }
  }],
  [/^gap-x-([^-]+)$/, ([, s]) => {
    const v = h.bracket.size(s)
    if (v != null) {
      return {
        'grid-column-gap': v,
        'column-gap': v,
      }
    }
  }],
  [/^gap-y-([^-]+)$/, ([, s]) => {
    const v = h.bracket.size(s)
    if (v != null) {
      return {
        'grid-row-gap': v,
        'row-gap': v,
      }
    }
  }],
]
