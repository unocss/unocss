import type { Rule } from '@unocss/core'
import { toArray } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from '../utils'

const calSize = (s: string, theme: Theme) => toArray(theme.fontSize?.[s] || h.bracket.rem(s))[0]

const autoDirection = (selector: string, theme: Theme) => {
  if (selector === 'min')
    return 'min-content'
  else if (selector === 'max')
    return 'max-content'
  else if (selector === 'fr')
    return 'minmax(0,1fr)'
  return calSize(selector, theme)
}

export const grids: Rule[] = [
  // base
  ['grid', { display: 'grid' }],
  ['inline-grid', { display: 'inline-grid' }],
  [/^(?:grid-)?col-start-([\w.-]+)$/, ([, v]) => ({ 'grid-column-start': `${v}` })],
  [/^(?:grid-)?col-end-([\w.]+)$/, ([, v]) => ({ 'grid-column-end': `${v}` })],
  [/^(?:grid-)?row-start-([\w.-]+)$/, ([, v]) => ({ 'grid-row-start': `${v}` })],
  [/^(?:grid-)?row-end-([\w.-]+)$/, ([, v]) => ({ 'grid-row-end': `${v}` })],
  [/^(?:grid-)?(row|col)-(.+)$/, ([, d, v]) => {
    const key = d === 'row' ? 'grid-row' : 'grid-column'
    let raw = h.bracket(v)
    if (raw)
      return { [key]: raw }
    const parts = v.split('-')
    if (parts.length === 1 && parts[0] === 'auto')
      return { [key]: parts[0] }
    if (parts[0] === 'span') {
      if (parts[1] === 'full')
        return { [key]: '1/-1' }

      raw = h.number.bracket(parts[1])?.toString().replace(/_/g, ' ')
      if (raw)
        return { [key]: `span ${raw}/span ${raw}` }
    }
  }],

  // templates
  [/^(?:grid-)?auto-cols-([\w.-]+)$/, ([, v], { theme }) => ({ 'grid-auto-columns': `${autoDirection(v, theme)}` })],
  [/^(?:grid-)?auto-flow-([\w.-]+)$/, ([, v]) => ({ 'grid-auto-flow': `${v.replace('col', 'column').split('-').join(' ')}` })],
  [/^(?:grid-)?auto-rows-([\w.-]+)$/, ([, v], { theme }) => ({ 'grid-auto-rows': `${autoDirection(v, theme)}` })],
  [/^grid-cols-minmax-([\w.-]+)$/, ([, d]) => ({ 'grid-template-columns': `repeat(auto-fill, minmax(${d}, 1fr))` })],
  [/^grid-rows-minmax-([\w.-]+)$/, ([, d]) => ({ 'grid-template-rows': `repeat(auto-fill, minmax(${d}, 1fr))` })],
  [/^grid-cols-(\d+)$/, ([, d]) => ({ 'grid-template-columns': `repeat(${d},minmax(0,1fr))` })],
  [/^grid-rows-(\d+)$/, ([, d]) => ({ 'grid-template-rows': `repeat(${d},minmax(0,1fr))` })],
  [/^grid-cols-\[(.+)\]$/, ([, v]) => ({ 'grid-template-columns': v.replace(/,/g, ' ') })],
  [/^grid-rows-\[(.+)\]$/, ([, v]) => ({ 'grid-template-rows': v.replace(/,/g, ' ') })],
]
