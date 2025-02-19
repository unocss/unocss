import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { h, numberResolver } from '../utils'

const directions: Record<string, string> = {
  '': '',
  'x': 'column-',
  'y': 'row-',
  'col': 'column-',
  'row': 'row-',
}

function handleGap([, d = '', s]: string[]) {
  const v = numberResolver(s)
  if (v != null)
    return { [`${directions[d]}gap`]: `calc(var(--spacing) * ${v})` }
  return { [`${directions[d]}gap`]: h.bracket.cssvar.global.rem(s) }
}

export const gaps: Rule<Theme>[] = [
  [/^(?:flex-|grid-)?gap-?()(.+)$/, handleGap, { autocomplete: ['gap-$spacing', 'gap-<num>'] }],
  [/^(?:flex-|grid-)?gap-([xy])-?(.+)$/, handleGap, { autocomplete: ['gap-(x|y)-$spacing', 'gap-(x|y)-<num>'] }],
  [/^(?:flex-|grid-)?gap-(col|row)-?(.+)$/, handleGap, { autocomplete: ['gap-(col|row)-$spacing', 'gap-(col|row)-<num>'] }],
]
