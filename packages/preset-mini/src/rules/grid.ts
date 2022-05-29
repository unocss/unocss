import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from '../utils'

const rowCol = (s: string) => s.replace('col', 'column')
const rowColTheme = (s: string) => s[0] === 'r' ? 'Row' : 'Column'

const autoDirection = (c: string, theme: Theme, prop: string) => {
  const v = theme[`gridAuto${rowColTheme(c)}`]?.[prop]
  if (v != null)
    return v

  switch (prop) {
    case 'min': return 'min-content'
    case 'max': return 'max-content'
    case 'fr': return 'minmax(0,1fr)'
  }

  return h.bracket.cssvar.auto.rem(prop)
}

export const grids: Rule<Theme>[] = [
  // displays
  ['grid', { display: 'grid' }],
  ['inline-grid', { display: 'inline-grid' }],

  // global
  [/^(?:grid-)?(row|col)-(.+)$/, ([, c, v], { theme }) => ({
    [`grid-${rowCol(c)}`]: theme[`grid${rowColTheme(c)}`]?.[v] ?? h.bracket.cssvar.auto(v),
  })],

  // span
  [/^(?:grid-)?(row|col)-span-(.+)$/, ([, c, s]) => {
    if (s === 'full')
      return { [`grid-${rowCol(c)}`]: '1/-1' }
    const v = h.bracket.number(s)
    if (v != null)
      return { [`grid-${rowCol(c)}`]: `span ${v}/span ${v}` }
  }, { autocomplete: ['grid-(row|col)-span-<num>', '(row|col)-span-<num>'] }],

  // starts & ends
  [/^(?:grid-)?(row|col)-start-(.+)$/, ([, c, v]) => ({ [`grid-${rowCol(c)}-start`]: h.bracket.cssvar(v) ?? v })],
  [/^(?:grid-)?(row|col)-end-(.+)$/, ([, c, v]) => ({ [`grid-${rowCol(c)}-end`]: h.bracket.cssvar(v) ?? v })],

  // auto flows
  [/^(?:grid-)?auto-(rows|cols)-(.+)$/, ([, c, v], { theme }) => ({ [`grid-auto-${rowCol(c)}`]: autoDirection(c, theme, v) })],

  // grid-auto-flow, auto-flow: uno
  // grid-flow: wind
  [/^(?:grid-auto-flow|auto-flow|grid-flow)-(.+)$/, ([, v]) => ({ 'grid-auto-flow': h.bracket.cssvar(v) })],
  [/^(?:grid-auto-flow|auto-flow|grid-flow)-(row|col|dense|row-dense|col-dense)$/, ([, v]) => ({ 'grid-auto-flow': rowCol(v).replace('-', ' ') })],

  // templates
  [/^grid-(rows|cols)-(.+)$/, ([, c, v], { theme }) => ({
    [`grid-template-${rowCol(c)}`]: theme[`gridTemplate${rowColTheme(c)}`]?.[v] ?? h.bracket.cssvar(v),
  })],
  [/^grid-(rows|cols)-minmax-([\w.-]+)$/, ([, c, d]) => ({ [`grid-template-${rowCol(c)}`]: `repeat(auto-fill,minmax(${d},1fr))` })],
  [/^grid-(rows|cols)-(\d+)$/, ([, c, d]) => ({ [`grid-template-${rowCol(c)}`]: `repeat(${d},minmax(0,1fr))` })],

  // template none
  ['grid-rows-none', { 'grid-template-rows': 'none' }],
  ['grid-cols-none', { 'grid-template-columns': 'none' }],
]
