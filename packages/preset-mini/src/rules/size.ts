import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { capitalize, handler as h } from '../utils'

function getPropName(minmax: string, hw: string) {
  return `${minmax ? `${minmax}-` : ''}${hw === 'h' ? 'height' : 'width'}`
}

type SizeProps = 'width' | 'height' | 'maxWidth' | 'maxHeight' | 'minWidth' | 'minHeight'

function getThemeValue(minmax: string, hw: string, theme: Theme, prop: string) {
  let str: SizeProps = `${hw === 'h' ? 'height' : 'width'}`
  if (minmax)
    str = `${minmax as 'min' | 'max'}${capitalize(str)}`
  return theme[str]?.[prop]
}

export const sizes: Rule<Theme>[] = [
  [/^(?:(min|max)-)?(w|h)-(.+)$/, ([, m, w, s], { theme }) => {
    const v = getThemeValue(m, w, theme, s) || h.bracket.cssvar.fraction.auto.rem(s)
    if (v != null)
      return { [getPropName(m, w)]: v }
  }],
  [/^(?:(min|max)-)?(w)-screen-(.+)$/, ([, m, w, s], { theme }) => {
    const v = theme.breakpoints?.[s]
    if (v != null)
      return { [getPropName(m, w)]: v }
  }],
]

export const aspectRatio: Rule[] = [
  ['aspect-ratio-auto', { 'aspect-ratio': 'auto' }],
  [/^aspect-ratio-(.+)$/, ([, d]: string[]) => ({ 'aspect-ratio': (/^\d+\/\d+$/.test(d) ? d : null) || h.bracket.cssvar.number(d) })],
]
