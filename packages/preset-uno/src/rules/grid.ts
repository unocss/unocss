import { toArray, Rule } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'

const calSize = (s: string, theme: Theme) => toArray(theme.fontSize?.[s] || h.bracket.rem(s))[0]

const isNumber = (s: string) => !isNaN(Number(s))

const autoDirection = (selector: string, theme: Theme) => {
  if (selector === 'min')
    return 'min-content'
  else if (selector === 'max')
    return 'max-content'
  else if (selector === 'fr')
    return 'minmax(0, 1fr)'
  return calSize(selector, theme)
}

export const grids: Rule[] = [
  ['grid', { display: 'grid' }],
  ['inline-grid', { display: 'inline-grid' }],
  [/^grid-cols-(\d+)$/, ([, d]) => ({ 'grid-template-columns': `repeat(${d}, minmax(0, 1fr))` })],
  [/^grid-rows-(\d+)$/, ([, d]) => ({ 'grid-template-rows': `repeat(${d}, minmax(0, 1fr))` })],
  [/^grid-cols-\[(.+)\]$/, ([, v]) => ({ 'grid-template-columns': v.replace(/,/g, ' ') })],
  [/^grid-rows-\[(.+)\]$/, ([, v]) => ({ 'grid-template-rows': v.replace(/,/g, ' ') })],
  [/^(?:grid-)?auto-flow-(.+)$/, ([, v]) => ({ 'grid-auto-flow': `${v.replace('col', 'column').split('-').join(' ')}` })],
  [/^(?:grid-)?row-start-(.+)$/, ([, v]) => ({ 'grid-row-start': `${v}` })],
  [/^(?:grid-)?row-end-(.+)$/, ([, v]) => ({ 'grid-row-end': `${v}` })],
  [/^(?:grid-)?col-start-(.+)$/, ([, v]) => ({ 'grid-column-start': `${v}` })],
  [/^(?:grid-)?col-end-(.+)$/, ([, v]) => ({ 'grid-column-end': `${v}` })],
  [/^(?:grid-)?auto-rows-(.+)$/, ([, v], theme) => ({ 'grid-auto-rows': `${autoDirection(v, theme)}` })],
  [/^(?:grid-)?auto-cols-(.+)$/, ([, v], theme) => ({ 'grid-auto-columns': `${autoDirection(v, theme)}` })],
  [/^(?:grid-)?row-((?!(start)|(end)).+)$/, ([, v]) => {
    const shortArr = v.split('-')
    if (shortArr[0] === 'span') {
      if (shortArr[1] === 'full') {
        return {
          'grid-row': '1 / -1',
        }
      }

      return isNumber(shortArr[1]) ? { 'grid-row': `span ${shortArr[1]} / span ${shortArr[1]}` } : undefined
    }
    return { 'grid-row': v.split('-').join(' ') }
  }],
  [/^(?:grid-)?col-((?!(start)|(end)).+)$/, ([, v]) => {
    const shortArr = v.split('-')
    if (shortArr[0] === 'span') {
      if (shortArr[1] === 'full') {
        return {
          'grid-column': '1 / -1',
        }
      }

      return isNumber(shortArr[1]) ? { 'grid-column': `span ${shortArr[1]} / span ${shortArr[1]}` } : undefined
    }
    return { 'grid-column': v.split('-').join(' ') }
  }],
]
