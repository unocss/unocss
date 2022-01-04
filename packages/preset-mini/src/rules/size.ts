import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { capitalize, handler as h } from '../utils'

function getPropName(minmax: string, hw: string) {
  return `${minmax ? `${minmax}-` : ''}${hw === 'h' ? 'height' : 'width'}`
}

type SizeProps = 'width' | 'height' | 'maxWidth' | 'maxHeight' | 'minWidth' | 'minHeight'

function getSizeValue(minmax: string, hw: string, theme: Theme, prop: string) {
  let str: SizeProps = `${hw === 'h' ? 'height' : 'width'}`
  if (minmax)
    str = `${minmax as 'min' | 'max'}${capitalize(str)}`
  const v = theme[str]?.[prop]
  if (v != null)
    return v

  switch (prop) {
    case 'fit':
    case 'max':
    case 'min':
      return `${prop}-content`
  }

  return h.bracket.cssvar.fraction.auto.rem(prop)
}

export const sizes: Rule<Theme>[] = [
  [/^(?:(min|max)-)?(w|h)-(.+)$/, ([, m, w, s], { theme }) => ({ [getPropName(m, w)]: getSizeValue(m, w, theme, s) })],
  [/^(?:(min|max)-)?(w)-screen-(.+)$/, ([, m, w, s], { theme }) => ({ [getPropName(m, w)]: theme.breakpoints?.[s] })],
]

function getAspectRatio(prop: string) {
  if (/^\d+\/\d+$/.test(prop))
    return prop

  switch (prop) {
    case 'square': return '1/1'
    case 'video': return '16/9'
  }

  return h.bracket.cssvar.auto.number(prop)
}

export const aspectRatio: Rule[] = [
  [/^aspect-(?:ratio-)?(.+)$/, ([, d]: string[]) => ({ 'aspect-ratio': getAspectRatio(d) })],
]
