import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { h, numberResolver, themeTracking } from '../utils'

export const flex: Rule<Theme>[] = [
  // display
  ['flex', { display: 'flex' }],
  ['inline-flex', { display: 'inline-flex' }],
  ['flex-inline', { display: 'inline-flex' }],

  // flex
  [/^flex-(.*)$/, ([, d], { theme }) => {
    const value = h.bracket(d, theme)
    return { flex: value != null ? value.split(' ').map(e => h.cssvar.fraction(e) ?? e).join(' ') : h.cssvar.fraction(d) }
  }],
  ['flex-1', { flex: '1 1 0%' }],
  ['flex-auto', { flex: '1 1 auto' }],
  ['flex-initial', { flex: '0 1 auto' }],
  ['flex-none', { flex: 'none' }],

  // shrink/grow/basis
  [/^(?:flex-)?shrink(?:-(.*))?$/, ([, d = ''], { theme }) => ({ 'flex-shrink': h.bracket.cssvar.number(d, theme) ?? 1 }), { autocomplete: ['flex-shrink-<num>', 'shrink-<num>'] }],
  [/^(?:flex-)?grow(?:-(.*))?$/, ([, d = ''], { theme }) => ({ 'flex-grow': h.bracket.cssvar.number(d, theme) ?? 1 }), { autocomplete: ['flex-grow-<num>', 'grow-<num>'] }],
  [/^(?:flex-)?basis-(.+)$/, ([, d], { theme }) => {
    const v = numberResolver(d)
    if (v != null) {
      themeTracking(`spacing`)
      return { 'flex-basis': `calc(var(--spacing) * ${v})` }
    }
    return { 'flex-basis': h.bracket.cssvar.auto.fraction.rem(d, theme) }
  }, { autocomplete: ['flex-basis-$spacing', 'basis-$spacing'] }],

  // directions
  ['flex-row', { 'flex-direction': 'row' }],
  ['flex-row-reverse', { 'flex-direction': 'row-reverse' }],
  ['flex-col', { 'flex-direction': 'column' }],
  ['flex-col-reverse', { 'flex-direction': 'column-reverse' }],

  // wraps
  ['flex-wrap', { 'flex-wrap': 'wrap' }],
  ['flex-wrap-reverse', { 'flex-wrap': 'wrap-reverse' }],
  ['flex-nowrap', { 'flex-wrap': 'nowrap' }],
]
