import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { h, numberResolver, resolveSpace, themeTracking } from '../utils'

const directions: Record<string, string> = {
  '': '',
  'x': 'column-',
  'y': 'row-',
  'col': 'column-',
  'row': 'row-',
}

function handleGap([, d = '', s]: string[], { theme }: { theme: Theme }) {
  const spaceMap = resolveSpace(theme)
  const v = numberResolver(s, spaceMap[s as keyof typeof spaceMap])

  if (v != null) {
    if (!Number.isNaN(v)) {
      themeTracking('spacing')
      return { [`${directions[d]}gap`]: `calc(var(--spacing) * ${v})` }
    }
    else {
      themeTracking('spacing', s)
      return { [`${directions[d]}gap`]: `var(--spacing-${s})` }
    }
  }
  return { [`${directions[d]}gap`]: h.bracket.cssvar.global.rem(s) }
}

export const gaps: Rule<Theme>[] = [
  [/^(?:flex-|grid-)?gap-?()(.+)$/, handleGap, { autocomplete: ['gap-$spacing', 'gap-<num>'] }],
  [/^(?:flex-|grid-)?gap-([xy])-?(.+)$/, handleGap, { autocomplete: ['gap-(x|y)-$spacing', 'gap-(x|y)-<num>'] }],
  [/^(?:flex-|grid-)?gap-(col|row)-?(.+)$/, handleGap, { autocomplete: ['gap-(col|row)-$spacing', 'gap-(col|row)-<num>'] }],
]
