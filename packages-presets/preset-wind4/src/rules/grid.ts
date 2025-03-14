import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { h } from '../utils'

function rowCol(s: string) {
  return s.replace('col', 'column')
}

function autoDirection(prop: string) {
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
  [/^(?:grid-)?(row|col)-(.+)$/, ([, c, v]) => ({
    [`grid-${rowCol(c)}`]: h.bracket.cssvar.auto(v),
  })],

  // span
  [/^(?:grid-)?(row|col)-span-(.+)$/, ([, c, s]) => {
    if (s === 'full')
      return { [`grid-${rowCol(c)}`]: '1/-1' }
    const v = h.bracket.number(s)
    if (v != null)
      return { [`grid-${rowCol(c)}`]: `span ${v}/span ${v}` }
  }, { autocomplete: '(grid-row|grid-col|row|col)-span-<num>' }],

  // starts & ends
  [/^(?:grid-)?(row|col)-start-(.+)$/, ([, c, v]) => ({ [`grid-${rowCol(c)}-start`]: h.bracket.cssvar(v) ?? v })],
  [/^(?:grid-)?(row|col)-end-(.+)$/, ([, c, v]) => ({ [`grid-${rowCol(c)}-end`]: h.bracket.cssvar(v) ?? v }), { autocomplete: '(grid-row|grid-col|row|col)-(start|end)-<num>' }],

  // auto flows
  [/^(?:grid-)?auto-(rows|cols)-(.+)$/, ([, c, v]) => ({ [`grid-auto-${rowCol(c)}`]: autoDirection(v) }), { autocomplete: '(grid-auto|auto)-(rows|cols)-<num>' }],

  // grid-auto-flow, auto-flow: uno
  // grid-flow: wind
  [/^(?:grid-auto-flow|auto-flow|grid-flow)-(.+)$/, ([, v]) => ({ 'grid-auto-flow': h.bracket.cssvar(v) })],
  [/^(?:grid-auto-flow|auto-flow|grid-flow)-(row|col|dense|row-dense|col-dense)$/, ([, v]) => ({ 'grid-auto-flow': rowCol(v).replace('-', ' ') }), { autocomplete: ['(grid-auto-flow|auto-flow|grid-flow)-(row|col|dense|row-dense|col-dense)'] }],

  // templates
  [/^(?:grid-)?(rows|cols)-(.+)$/, ([, c, v]) => ({
    [`grid-template-${rowCol(c)}`]: h.bracket.cssvar(v),
  })],
  [/^(?:grid-)?(rows|cols)-minmax-([\w.-]+)$/, ([, c, d]) => ({ [`grid-template-${rowCol(c)}`]: `repeat(auto-fill,minmax(${d},1fr))` })],
  [/^(?:grid-)?(rows|cols)-(\d+)$/, ([, c, d]) => ({ [`grid-template-${rowCol(c)}`]: `repeat(${d},minmax(0,1fr))` }), { autocomplete: '(grid-rows|grid-cols|rows|cols)-<num>' }],

  // areas
  [/^grid-area(s)?-(.+)$/, ([, s, v]) => {
    if (s != null)
      return { 'grid-template-areas': h.cssvar(v) ?? v.split('-').map(s => `"${h.bracket(s)}"`).join(' ') }
    return { 'grid-area': h.bracket.cssvar(v) }
  }],

  // template none
  ['grid-rows-none', { 'grid-template-rows': 'none' }],
  ['grid-cols-none', { 'grid-template-columns': 'none' }],

  // template subgrid
  ['grid-rows-subgrid', { 'grid-template-rows': 'subgrid' }],
  ['grid-cols-subgrid', { 'grid-template-columns': 'subgrid' }],
]
