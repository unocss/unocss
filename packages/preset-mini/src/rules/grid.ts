import type { Rule } from '@unocss/core'
import { toArray } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from '../utils'

const rowCol = (s: string) => s.replace('col', 'column')

const autoDirection = (selector: string, theme: Theme) => {
  const v = theme.fontSize?.[selector]
  if (v != null)
    return toArray(v)[0]

  switch (selector) {
    case 'min': return 'min-content'
    case 'max': return 'max-content'
    case 'fr': return 'minmax(0,1fr)'
  }

  return h.bracket.cssvar.auto.rem(selector)
}

export const grids: Rule[] = [
  // displays
  ['grid', { display: 'grid' }],
  ['inline-grid', { display: 'inline-grid' }],

  // global
  [/^(?:grid-)?(row|col)-(.+)$/, ([, c, v]) => ({ [`grid-${rowCol(c)}`]: h.bracket.cssvar.auto(v) })],

  // span
  [/^(?:grid-)?(row|col)-span-(.+)$/, ([, c, s]) => {
    if (s === 'full')
      return { [`grid-${rowCol(c)}`]: '1/-1' }
    const v = h.bracket.number(s)
    if (v != null)
      return { [`grid-${rowCol(c)}`]: `span ${v}/span ${v}` }
  }],

  // starts & ends
  [/^(?:grid-)?(row|col)-start-(.+)$/, ([, c, v]) => ({ [`grid-${rowCol(c)}-start`]: h.bracket.cssvar(v) ?? v })],
  [/^(?:grid-)?(row|col)-end-(.+)$/, ([, c, v]) => ({ [`grid-${rowCol(c)}-end`]: h.bracket.cssvar(v) ?? v })],

  // auto flows
  [/^(?:grid-)?auto-(rows|cols)-(.+)$/, ([, c, v], { theme }) => ({ [`grid-auto-${rowCol(c)}`]: autoDirection(v, theme) })],

  // grid-auto-flow, auto-flow: uno
  // grid-flow: wind
  [/^(?:grid-auto-flow|auto-flow|grid-flow)-(.+)$/, ([, v]) => ({ 'grid-auto-flow': h.bracket.cssvar(v) })],
  [/^(?:grid-auto-flow|auto-flow|grid-flow)-((?:row|col)(?:-dense)?)$/, ([, v]) => ({ 'grid-auto-flow': rowCol(v).replace('-', ' ') })],

  // templates
  [/^grid-(rows|cols)-(.+)$/, ([, c, v]) => ({ [`grid-template-${rowCol(c)}`]: h.bracket.cssvar(v) })],
  [/^grid-(rows|cols)-minmax-([\w.-]+)$/, ([, c, d]) => ({ [`grid-template-${rowCol(c)}`]: `repeat(auto-fill,minmax(${d},1fr))` })],
  [/^grid-(rows|cols)-(\d+)$/, ([, c, d]) => ({ [`grid-template-${rowCol(c)}`]: `repeat(${d},minmax(0,1fr))` })],

  // template none
  ['grid-rows-none', { 'grid-template-rows': 'none' }],
  ['grid-cols-none', { 'grid-template-columns': 'none' }],
]
