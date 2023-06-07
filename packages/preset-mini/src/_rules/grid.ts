import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from '../utils'

function rowCol(s: string) {
  return s.replace('col', 'column')
}
function rowColTheme(s: string) {
  return s[0] === 'r' ? 'Row' : 'Column'
}

function autoDirection(c: string, theme: Theme, prop: string) {
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

function indexOfAny(str: string, vals: string[], start = 0) {
  return vals.reduce((c, v) => {
    const i = str.indexOf(v, start)
    if (i !== -1 && (c === -1 || i < c))
      c = i
    return c
  }, -1)
}

function replaceCommas(str: string) {
  const indices = [',', '(', ')']
  let result = ''
  let bracketCount = 0
  let start = 0
  let i = indexOfAny(str, indices)
  while (i !== -1) {
    switch (str[i]) {
      case ',':
        result += `${str.substring(start, i)} `
        start = i + 1
        break
      case '(':
        bracketCount++
        break
      case ')':
        bracketCount--
        break
    }
    i = indexOfAny(str, (bracketCount === 0) ? indices : ['(', ')'], i + 1)
  }
  result += str.substring(start)
  return result
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
  [/^(?:grid-)?(row|col)-end-(.+)$/, ([, c, v]) => ({ [`grid-${rowCol(c)}-end`]: h.bracket.cssvar(v) ?? v }), { autocomplete: ['grid-(row|col)-(start|end)-<num>'] }],

  // auto flows
  [/^(?:grid-)?auto-(rows|cols)-(.+)$/, ([, c, v], { theme }) => ({ [`grid-auto-${rowCol(c)}`]: autoDirection(c, theme, v) }), { autocomplete: ['grid-auto-(rows|cols)-<num>'] }],

  // grid-auto-flow, auto-flow: uno
  // grid-flow: wind
  [/^(?:grid-auto-flow|auto-flow|grid-flow)-(.+)$/, ([, v]) => ({ 'grid-auto-flow': h.bracket.cssvar(v) })],
  [/^(?:grid-auto-flow|auto-flow|grid-flow)-(row|col|dense|row-dense|col-dense)$/, ([, v]) => ({ 'grid-auto-flow': rowCol(v).replace('-', ' ') }), { autocomplete: ['(grid-auto-flow|auto-flow|grid-flow)-(row|col|dense|row-dense|col-dense)'] }],

  // templates
  [/^grid-(rows|cols)-(.+)$/, ([, c, v], { theme }) => ({
    [`grid-template-${rowCol(c)}`]: theme[`gridTemplate${rowColTheme(c)}`]?.[v] ?? replaceCommas(h.bracket.cssvar(v) ?? ''),
  })],
  [/^grid-(rows|cols)-minmax-([\w.-]+)$/, ([, c, d]) => ({ [`grid-template-${rowCol(c)}`]: `repeat(auto-fill,minmax(${d},1fr))` })],
  [/^grid-(rows|cols)-(\d+)$/, ([, c, d]) => ({ [`grid-template-${rowCol(c)}`]: `repeat(${d},minmax(0,1fr))` }), { autocomplete: ['grid-(rows|cols)-<num>', 'grid-(rows|cols)-none'] }],

  // areas
  [/^grid-area(s)?-(.+)$/, ([, s, v]) => {
    if (s != null)
      return { 'grid-template-areas': h.cssvar(v) ?? v.split('-').map(s => `"${h.bracket(s)}"`).join(' ') }
    return { 'grid-area': h.bracket.cssvar(v) }
  }],

  // template none
  ['grid-rows-none', { 'grid-template-rows': 'none' }],
  ['grid-cols-none', { 'grid-template-columns': 'none' }],
]
