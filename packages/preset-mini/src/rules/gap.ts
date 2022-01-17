import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const directions: Record<string, string> = {
  '': '',
  'x': 'column-',
  'y': 'row-',
}

const handleGap = ([, d = '', s]: string[]) => {
  const v = h.bracket.cssvar.rem(s)
  if (v != null) {
    return {
      [`grid-${directions[d]}gap`]: v,
      [`${directions[d]}gap`]: v,
    }
  }
}

export const gaps: Rule[] = [
  [/^(?:flex-|grid-)?gap-()([^-]+)$/, handleGap],
  [/^(?:flex-|grid-)?gap-([xy])-([^-]+)$/, handleGap],
]
